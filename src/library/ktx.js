class KtxDecoder {

    constructor (context, externalKtxlib) {
        this.gl = context;
        this.libktx = null;
        if (context !== undefined)
        {
            if (externalKtxlib === undefined && LIBKTX !== undefined)
            {
                externalKtxlib = LIBKTX;
            }
            if (externalKtxlib !== undefined)
            {
                this.initializied = this.init(context, externalKtxlib);
            }
            else
            {
                console.error('Failed to initalize KTXDecoder: ktx library undefined');
                return undefined;
            }
        }
        else
        {
            console.error('Failed to initalize KTXDecoder: WebGL context undefined');
            return undefined;
        }
    }

    async init(context, externalKtxlib) {
        this.libktx = await externalKtxlib({preinitializedWebGLContext: context});
        this.libktx.GL.makeContextCurrent(this.libktx.GL.createContext(context.canvas, { majorVersion: 2.0 }));
    }

    stringToUastcFlags(f) {
        if (f === 'FASTER') return this.libktx.UastcFlags.LEVEL_FASTER.value;
        else if (f === 'FASTEST') return this.libktx.UastcFlags.LEVEL_FASTEST.value;
        else if (f === 'SLOWER') return this.libktx.UastcFlags.LEVEL_SLOWER.value;
        else if (f === 'SLOWEST') return this.libktx.UastcFlags.LEVEL_VERYSLOW.value;
        else return this.libktx.UastcFlags.LEVEL_DEFAULT.value; 
    }

    stringToSupercmpScheme(s) {
        if (s === 'Zstd') return this.libktx.SupercmpScheme.ZSTD;
        else if (s === 'Zlib') return this.libktx.SupercmpScheme.ZLIB;
        else if (s === 'BasisLZ') return this.libktx.SupercmpScheme.BASIS_LZ;
        else return this.libktx.SupercmpScheme.NONE;
    }

    transcodeRGBA(ktexture) {
        if (!ktexture.needsTranscoding) {
            return;
        }
        const format = this.libktx.TranscodeTarget.RGBA8888;
        if (ktexture.transcodeBasis(format, 0) != this.libktx.ErrorCode.SUCCESS) {
            console.warn('Texture transcode failed. See console for details.');
        }
    }

    transcode(ktexture) {
        ktexture.gpuFormat = "RGBA8888";
        if (ktexture.needsTranscoding) {
            let format;

            let astcSupported = false;
            let etcSupported = false;
            let dxtSupported = false;
            let bptcSupported = false;
            let pvrtcSupported = false;

            astcSupported = !!this.gl.getExtension('WEBGL_compressed_texture_astc');
            etcSupported = !!this.gl.getExtension('WEBGL_compressed_texture_etc1');
            dxtSupported = !!this.gl.getExtension('WEBGL_compressed_texture_s3tc');
            bptcSupported = !!this.gl.getExtension('EXT_texture_compression_bptc');

            pvrtcSupported = !!(this.gl.getExtension('WEBGL_compressed_texture_pvrtc')) || !!(this.gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc'));

            if (astcSupported) {
                format = this.libktx.TranscodeTarget.ASTC_4x4_RGBA;
                ktexture.gpuFormat = "ASTC_4x4_RGBA";
            } else if (bptcSupported) {
                format = this.libktx.TranscodeTarget.BC7_RGBA;
                ktexture.gpuFormat = "BC7_RGBA";
            } else if (dxtSupported) {
                format = this.libktx.TranscodeTarget.BC1_OR_3;
                ktexture.gpuFormat = "BC1_OR_3";
            } else if (pvrtcSupported) {
                format = this.libktx.TranscodeTarget.PVRTC1_4_RGBA;
                ktexture.gpuFormat = "PVRTC1_4_RGBA";
            } else if (etcSupported) {
                format = this.libktx.TranscodeTarget.ETC;
                ktexture.gpuFormat = "ETC";
            } else {
                format = this.libktx.TranscodeTarget.RGBA8888;
                ktexture.gpuFormat = "RGBA8888";
            }
           
            if (ktexture.transcodeBasis(format, 0) != this.libktx.ErrorCode.SUCCESS) {
                console.warn('Texture transcode failed. See console for details.');
            }
        }
    }

    async loadKtxFromUri(uri) {
        await this.initializied;
        const response = await fetch(uri);
        const data = new Uint8Array(await response.arrayBuffer());
        const texture = new this.libktx.ktxTexture(data);
        this.transcode(texture);
        let uploadResult = texture.glUpload();
        if (uploadResult.texture == null)
        {
            console.error("Could not load KTX data");
            return undefined;
        }
        
        uploadResult.texture.levels = Math.log2(texture.baseWidth);
        uploadResult.texture.width = texture.baseWidth;
        uploadResult.texture.height = texture.baseHeight;
        uploadResult.texture.gpuSize = texture.dataSize;
        uploadResult.texture.gpuFormat = texture.gpuFormat;
        uploadResult.texture.isSRGB = texture.isSRGB;
        
        return uploadResult.texture;
    }

    async loadKtxFromBuffer(data) {
        await this.initializied;
        const texture = new this.libktx.ktxTexture(data);
        this.transcode(texture);
        const uploadResult = texture.glUpload();
        if (uploadResult.texture == null)
        {
            console.error("Could not load KTX data");
            return undefined;
        }

        uploadResult.texture.levels = Math.log2(texture.baseWidth);
        uploadResult.texture.width = texture.baseWidth;
        uploadResult.texture.height = texture.baseHeight;
        uploadResult.texture.gpuSize = texture.dataSize;
        uploadResult.texture.gpuFormat = texture.gpuFormat;
        uploadResult.texture.isSRGB = texture.isSRGB;
       
        return uploadResult.texture;
    }

    async compress(raw_data, width, height, comps, options = {}) {
        const texture = new this.libktx.ktxTexture(raw_data, width, height, comps, options.srgb);

        if (!options.hasOwnProperty('basisu_options')) {
            const basisu_options = new this.libktx.ktxBasisParams();
            basisu_options.uastc = false;
            basisu_options.noSSE = true;
            basisu_options.verbose = false;
            basisu_options.qualityLevel = 100;
            basisu_options.compressionLevel = 2;
            options.basisu_options = basisu_options;
        }
        if (!options.hasOwnProperty('compression_level')) {
            options.compression_level = 18;
        }
        if (!options.hasOwnProperty('supercmp_scheme')) {
            options.supercmp_scheme = this.libktx.SupercmpScheme.NONE;
        }   
        console.log(options);
        const result = texture.compressBasisU(options.basisu_options, options.supercmp_scheme, options.compression_level);
        const encoded_data = Uint8ClampedArray.from(result);
        return encoded_data;
    }
}

export { KtxDecoder };
