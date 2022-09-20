#!/usr/bin/env sh
## 000_header.sh
##
## Borrowed from rustup (https://sh.rustup.rs)
##
## This is just a little script that can be downloaded from the internet to
## install dfx. It just does platform detection, downloads the installer
## and runs it.
##
## You are NOT AUTHORIZED to remove any license agreements or prompts from the following script.
##
set -u
## install/010_manifest.sh
get_tag_from_manifest_json() {
    cat \
        | tr -d '\n' \
        | grep -o "\"$1\":[[:space:]]*\"[a-zA-Z0-9.]*" \
        | grep -o "[0-9.]*$"
}
## 020_flags.sh
DFX_BOOL_FLAGS=""
define_flag_BOOL() {
    local VARNAME
    VARNAME="flag_$(echo "$1" | tr /a-z/ /A-Z)"
    eval "$VARNAME=\${$VARNAME:-}"
    DFX_BOOL_FLAGS="${DFX_BOOL_FLAGS}--${1} $VARNAME $2"
}
get_flag_name() {
    echo "$1"
}
get_var_name() {
    echo "$2"
}
read_flags() {
    while [ -n "$*" ]; do
        local ARG=$1
        shift
        OLD_IFS="$IFS"
        IFS=$'\n'
        for line in ${DFX_BOOL_FLAGS}; do
            [ "$line" ] || break
            IFS="$OLD_IFS"
            FLAG="$(get_flag_name "$line")"
            VARNAME="$(get_var_name "$line")"
            if [ "$ARG" == "$FLAG" ]; then
                eval "$VARNAME=1"
            fi
        done
    done
}
## 100_log.sh
log() {
    if "$_ansi_escapes_are_valid"; then
        printf "\33[1minfo:\33[0m %s\n" "$1" 1>&2
    else
        printf '%s\n' "$1" 1>&2
    fi
}
say() {
    printf 'dfinity-sdk: %s\n' "$1"
}
warn() {
    if $_ansi_escapes_are_valid; then
        printf "\33[1mwarn:\33[0m %s\n" "$1" 1>&2
    else
        printf '%s\n' "$1" 1>&2
    fi
}
err() {
    say "$1" >&2
    exit 1
}
## 110_assert.sh
need_cmd() {
    if ! check_cmd "$1"; then
        err "need '$1' (command not found)"
    fi
}
check_cmd() {
    command -v "$1" >/dev/null 2>&1
}
assert_nz() {
    if [ -z "$1" ]; then err "assert_nz $2"; fi
}
ensure() {
    if ! "$@"; then err "command failed: $*"; fi
}
ignore() {
    "$@"
}
## 200_downloader.sh
define_flag_BOOL "insecure" "Allows downloading from insecure URLs, either using HTTP or TLS 1.2 or less."
check_help_for() {
    local _cmd
    local _arg
    local _ok
    _cmd="$1"
    _ok="y"
    shift
    if check_cmd sw_vers; then
        case "$(sw_vers -productVersion)" in
            10.15*) ;;
            11.*) ;;
            12.*) ;;
            *)
                warn "Detected OS X platform older than 10.15 (Catalina)"
                _ok="n"
                ;;
        esac
    fi
    for _arg in "$@"; do
        if ! "$_cmd" --help | grep -q -- "$_arg"; then
            _ok="n"
        fi
    done
    test "$_ok" = "y"
}
check_support_for() {
    local err="$1"
    shift
    local cmd="$*"
    ! ($cmd 2>&1 | grep "$err" >/dev/null)
}
downloader() {
    local _dld
    if check_cmd curl; then
        _dld=curl
    elif check_cmd wget; then
        _dld=wget
    else
        _dld='curl or wget'
    fi
    if [ "$1" = --check ]; then
        need_cmd "$_dld"
    elif [ "$_dld" = curl ]; then
        if check_help_for curl --proto --tlsv1.2; then
            curl --proto '=https' --tlsv1.2 --show-error --fail --location "$1" --output "$2"
        elif ! [ "$flag_INSECURE" ]; then
            warn "Not forcing TLS v1.2, this is potentially less secure"
            curl --show-error --fail --location "$1" --output "$2"
        else
            err "TLS 1.2 is not supported on this platform. To force using it, use the --insecure flag."
        fi
    elif [ "$_dld" = wget ]; then
        if check_help_for wget --https-only --secure-protocol; then
            wget --https-only --secure-protocol=TLSv1_2 "$1" -O "$2"
        elif ! [ "$flag_INSECURE" ]; then
            warn "Not forcing TLS v1.2, this is potentially less secure"
            wget "$1" -O "$2"
        else
            err "TLS 1.2 is not supported on this platform. To force using it, use the --insecure flag."
        fi
    else
        err "Unknown downloader"
    fi
}
## 999_footer.sh
SDK_WEBSITE="https://sdk.dfinity.org"
DFX_RELEASE_ROOT="${DFX_RELEASE_ROOT:-$SDK_WEBSITE/downloads/dfx}"
DFX_GITHUB_RELEASE_ROOT="${DFX_GITHUB_RELEASE_ROOT:-https://github.com/dfinity/sdk/releases/download}"
DFX_MANIFEST_JSON_URL="${DFX_MANIFEST_JSON_URL:-$SDK_WEBSITE/manifest.json}"
DFX_VERSION="${DFX_VERSION:-}"
SCRIPT_COMMIT_DESC="b2927b8eeb1a26bea6f4008c4a662f2d6af499b0"
get_tag_from_manifest_json() {
    cat \
        | tr -d '\n' \
        | grep -o "\"$1\":[[:space:]]*\"[a-zA-Z0-9.]*" \
        | grep -o "[0-9.]*$"
}
get_manifest_version() {
    local _version
    _version="$(downloader "${DFX_MANIFEST_JSON_URL}" - | get_tag_from_manifest_json latest)" || return 2
    printf %s "${_version}"
}
validate_install_dir() {
    local dir="${1%/}"
    if ! [ -d "$dir" ]; then
        if ! mkdir -p "$dir"; then
            if type sudo >/dev/null; then
                sudo mkdir -p "$dir"
            fi
        fi
    fi
    ! [ -d "$dir" ] && return 1
    ! [ -w "$dir" ] && return 2
    case ":$PATH:" in
        *:$dir:*) ;;
        *) return 3 ;;
    esac
    return 0
}
sdk_install_dir() {
    if [ "${DFX_INSTALL_ROOT:-}" ]; then
        validate_install_dir "${DFX_INSTALL_ROOT}"
        printf %s "${DFX_INSTALL_ROOT}"
    elif validate_install_dir /usr/local/bin; then
        printf %s /usr/local/bin
    elif [ "$(uname -s)" = Darwin ]; then
        validate_install_dir /usr/local/bin
        printf %s /usr/local/bin
    elif validate_install_dir /usr/bin; then
        printf %s /usr/bin
    else
        printf %s "${HOME}/bin"
    fi
}
main() {
    _ansi_escapes_are_valid=false
    if [ -t 2 ]; then
        if [ "${TERM+set}" = 'set' ]; then
            case "$TERM" in
                xterm* | rxvt* | urxvt* | linux* | vt*)
                    _ansi_escapes_are_valid=true
                    ;;
            esac
        fi
    fi
    read_flags "$@"
    log "Executing dfx install script, commit: $SCRIPT_COMMIT_DESC"
    downloader --check
    need_cmd uname
    need_cmd mktemp
    need_cmd chmod
    need_cmd mkdir
    if check_cmd sha256sum; then
        SHASUM=sha256sum
    elif check_cmd shasum; then
        SHASUM=shasum
    else
        err "need 'shasum' or 'sha256sum' (neither command found)"
    fi
    need_cmd rm
    need_cmd tar
    need_cmd gzip
    need_cmd touch
    get_architecture || return 1
    local _arch="$RETVAL"
    assert_nz "$_arch" "arch"
    if [ -z "${DFX_VERSION}" ]; then
        DFX_VERSION=$(get_manifest_version)
    fi
    log "Version found: $DFX_VERSION"
    case "$DFX_VERSION" in
        0.[0-9].*)
            local _dfx_tarball_filename="dfx-${DFX_VERSION}.tar.gz"
            local _dfx_url="${DFX_RELEASE_ROOT}/${DFX_VERSION}/${_arch}/${_dfx_tarball_filename}"
            local _dfx_sha256_filename=""
            ;;
        *)
            local _dfx_tarball_filename="dfx-${DFX_VERSION}-${_arch}.tar.gz"
            local _dfx_url="${DFX_GITHUB_RELEASE_ROOT}/${DFX_VERSION}/${_dfx_tarball_filename}"
            local _dfx_sha256_filename="${_dfx_tarball_filename}.sha256"
            local _dfx_sha256_url="${_dfx_url}.sha256"
            ;;
    esac
    local _dir
    _dir="$(mktemp -d 2>/dev/null || ensure mktemp -d -t dfinity-sdk)"
    local _dfx_archive="${_dir}/${_dfx_tarball_filename}"
    local _dfx_file="${_dir}/dfx"
    log "Creating uninstall script in ~/.cache/dfinity"
    mkdir -p "${HOME}/.cache/dfinity/"
    install_uninstall_script
    log "Checking for latest release..."
    ensure mkdir -p "$_dir"
    ensure downloader "$_dfx_url" "$_dfx_archive"
    if [ -n "${_dfx_sha256_filename}" ]; then
        log "Checking integrity of tarball..."
        ensure downloader "$_dfx_sha256_url" "${_dir}/${_dfx_sha256_filename}"
        (
            ensure cd "${_dir}" >/dev/null
            ensure $SHASUM -c "${_dfx_sha256_filename}"
        )
    fi
    tar -xf "$_dfx_archive" -O >"$_dfx_file"
    ensure chmod u+x "$_dfx_file"
    local _install_dir
    _install_dir="$(sdk_install_dir)"
    printf "%s\n" "Will install in: ${_install_dir}"
    mkdir -p "${_install_dir}" || true
    if [ -w "${_install_dir}" ]; then
        MV="mv"
    else
        if ! type sudo >/dev/null; then
            err "Install directory '${_install_dir}' not writable and sudo command not found"
        fi
        MV="sudo mv"
    fi
    $MV "$_dfx_file" "${_install_dir}" 2>/dev/null \
        || err "Failed to install the DFINITY Development Kit: please check your permissions and try again."
    log "Installed $_install_dir/dfx"
    ignore rm -rf "$_dir"
}
get_architecture() {
    local _ostype _cputype _arch
    _ostype="$(uname -s)"
    _cputype="$(uname -m)"
    if [ "$_ostype" = Darwin ] && [ "$_cputype" = i386 ]; then
        if sysctl hw.optional.x86_64 | grep -q ': 1'; then
            _cputype=x86_64
        fi
    fi
    if [ "$_ostype" = Darwin ] && [ "$_cputype" = arm64 ]; then
        _cputype=x86_64
    fi
    case "$_ostype" in
        Linux)
            _ostype=linux
            ;;
        Darwin)
            _ostype=darwin
            ;;
        *)
            err "unrecognized OS type: $_ostype"
            ;;
    esac
    case "$_cputype" in
        x86_64 | x86-64 | x64 | amd64)
            _cputype=x86_64
            ;;
        *)
            err "unknown CPU type: $_cputype"
            ;;
    esac
    _arch="${_cputype}-${_ostype}"
    RETVAL="$_arch"
}
install_uninstall_script() {
    set +u
    local uninstall_file_path
    local uninstall_script
    uninstall_script=$(
        cat <<'EOF'
#!/usr/bin/env sh
uninstall() {
    check_rm "${DFX_INSTALL_ROOT}/dfx"
    check_rm "${HOME}/bin/dfx"
    check_rm /usr/local/bin/dfx /usr/bin/dfx
    clean_cache
}
check_rm() {
    local file
    for file in "$@"
    do
        [ -e "${file}" ] && rm "${file}"
    done
}
clean_cache() {
    if [ -z "$HOME" ]; then
        exit "HOME environment variable unset."
    fi
    rm -Rf "${HOME}/.cache/dfinity"
}
uninstall
EOF
    )
    set -u
    assert_nz "${HOME}"
    uninstall_file_path="${HOME}/.cache/dfinity/uninstall.sh"
    log "uninstall path=${uninstall_file_path}"
    rm -f "${uninstall_file_path}"
    printf "%s" "$uninstall_script" >"${uninstall_file_path}"
    ensure chmod u+x "${uninstall_file_path}"
}
main "$@" || exit $?
