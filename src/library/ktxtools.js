import { KtxDecoder } from "./ktx";

export class KTXTools{
    constructor(){
        this.ktxEncoder = null;
        this.libktx = null;
        this.init();
    }

    async init() {
        const canvasWebgl = document.createElement('canvas');
        const gl = canvasWebgl.getContext('webgl'); // WebGL context is needed for KTX operations
        const ktxEncoder = new KtxDecoder(gl, window.LIBKTX);
        await ktxEncoder.init(gl, window.LIBKTX);
        this.ktxEncoder = ktxEncoder;
        this.libktx = ktxEncoder.libktx;
    }

    async compress(raw_data, width, height, comps, options = {}){
        const basisu_options = await new this.libktx.ktxBasisParams();
        const userBasisuOptions = options;

        basisu_options.uastc = userBasisuOptions.uastc !== undefined ? userBasisuOptions.uastc : false;
        basisu_options.noSSE = userBasisuOptions.noSSE !== undefined ? userBasisuOptions.noSSE : false;
        basisu_options.verbose = userBasisuOptions.verbose !== undefined ? userBasisuOptions.verbose :  false;
        basisu_options.normalMap = userBasisuOptions.normalMap !== undefined ? userBasisuOptions.normalMap :  false;

        basisu_options.compressionLevel = userBasisuOptions.compressionLevel !== undefined ? userBasisuOptions.compressionLevel : 1;
        basisu_options.qualityLevel = userBasisuOptions.qualityLevel !== undefined ? userBasisuOptions.qualityLevel : 60;
        

        //== ETC1S ==
        basisu_options.maxEndpoints = userBasisuOptions.ETC1SmaxEndpoints !== undefined ?userBasisuOptions.ETC1SmaxEndpoints : 0;
        basisu_options.endpointRDOThreshold = userBasisuOptions.ETC1SEndpointRdoThreshold !== undefined ? userBasisuOptions.ETC1SEndpointRdoThreshold : 1.25;
        basisu_options.maxSelectors = userBasisuOptions.ETC1SMaxSelectors !== undefined ? userBasisuOptions.ETC1SMaxSelectors : 0;
        basisu_options.selectorRDOThreshold = userBasisuOptions.ETC1SSelectorRdoThreshold !== undefined ? userBasisuOptions.ETC1SSelectorRdoThreshold : 1.25;
        // basisu_options.normalMap = targetKTX2_ETC1S_normalMap;
        // basisu_options.preSwizzle = false;
        basisu_options.noEndpointRDO = userBasisuOptions.ETC1SNoEndpointRdo !== undefined ? userBasisuOptions.ETC1SNoEndpointRdo : false;
        basisu_options.noSelectorRDO = userBasisuOptions.ETC1SNoSelectorRdo !== undefined ? userBasisuOptions.ETC1SNoSelectorRdo : false;


        //== UASTC ==
        basisu_options.uastcFlags = this.ktxEncoder.stringToUastcFlags(userBasisuOptions.uastcFlags);
        basisu_options.uastcRDO = basisu_options.uastcRDO !== undefined ? basisu_options.uastcRDO : false;
        basisu_options.uastcRDOQualityScalar = userBasisuOptions.uastcRDOQualityScalar !== undefined ? userBasisuOptions.uastcRDOQualityScalar : 1.0;
        basisu_options.uastcRDODictSize = userBasisuOptions.uastcRDODictSize !== undefined ? userBasisuOptions.uastcRDOQualityScalar : 4096;
        basisu_options.uastcRDOMaxSmoothBlockErrorScale = userBasisuOptions.uastcRDOMaxSmoothBlockErrorScale !== undefined? userBasisuOptions.uastcRDOMaxSmoothBlockErrorScale : 10.0;
        basisu_options.uastcRDOMaxSmoothBlockStdDev = userBasisuOptions.uastcRDOMaxSmoothBlockStdDev !== undefined? userBasisuOptions.uastcRDOMaxSmoothBlockStdDev : 18.0;
        basisu_options.uastcRDODontFavorSimplerModes = userBasisuOptions.uastcRDODontFavorSimplerModes !== undefined ? userBasisuOptions.uastcRDODontFavorSimplerModes : false;
                
        // missing
        //userBasisuOptions.ETC1SQualityLevel
        options.basisu_options = basisu_options;

        // supercmp_scheme
        if (!options.hasOwnProperty('supercmp_scheme')){
            options.supercmp_scheme = this.libktx.SupercmpScheme.NONE;
        }
        else{
            options.supercmp_scheme = this.ktxEncoder.stringToSupercmpScheme(options.supercmp_scheme);
        }

        // if (!options.hasOwnProperty('compression_level')) {
        //     options.compression_level = 18;
        // }
        return await this.ktxEncoder.compress(raw_data, width, height, comps, options);
    }
}