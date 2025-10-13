function createElementNS( name:string ) {

	return document.createElementNS( 'http://www.w3.org/1999/xhtml', name );

}
//@ts-ignore
let _canvas:HTMLCanvasElement;
export function getDataURL( image:any ) {

    if ( /^data:/i.test( image.src ) ) {

        return image.src;

    }

    if ( typeof HTMLCanvasElement === 'undefined' ) {

        return image.src;

    }

    let canvas;

    if ( image instanceof HTMLCanvasElement ) {

        canvas = image;

    } else {

        if ( _canvas === undefined ) _canvas = createElementNS( 'canvas' ) as HTMLCanvasElement;

        _canvas.width = image.width;
        _canvas.height = image.height;

        const context = _canvas.getContext( '2d' );

        if ( image instanceof ImageData ) {

            context?.putImageData( image, 0, 0 );

        } else {

            context?.drawImage( image, 0, 0, image.width, image.height );

        }

        canvas = _canvas;

    }

    return canvas.toDataURL( 'image/png' );

}