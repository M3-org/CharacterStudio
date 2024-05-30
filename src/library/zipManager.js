import JSZip from 'jszip';


export class ZipManager{
    constructor() {
        this.zipContainer = {};
    }

    addData(data, dataName, extension, zipFolder = ""){

        if (zipFolder == "") zipFolder = "_";
            
        if ( this.zipContainer[zipFolder] == null){
            this.zipContainer[zipFolder] = [];
        }

        this.zipContainer[zipFolder].push({ data: data , name: dataName, extension:extension});

    }

    // Function to save the image array as a zip folder
    saveZip(zipName, reset = true) {
        const zipContainer = this.zipContainer;
        const zip = new JSZip();
        // zip.file(filename + ".txt", textContent);
        for (const prop in zipContainer){
            if (prop == "_"){
                
                //zip.file(image.name + ".png", image.data.split("base64,")[1], { base64: true });
                zipContainer[prop].forEach((data, index) => {
                    zip.file(data.name + "." + data.extension, data.data, { base64: true });
                });
            }
            else{
                const folder = zip.folder(prop);
                
                
                zipContainer[prop].forEach((data, index) => {
                    const base64 = data.extension != "txt" ? true : false;
                    folder.file(data.name + "." + data.extension, data.data, { base64: base64 });
                });

            }

        }

        zip.generateAsync({ type: "blob" })
        .then((content) => {
            this._saveZipFile(content, zipName+".zip");

        });

        if (reset)
            this.zipContainer = {}
        
       
    }

    _saveZipFile(strData, filename) {
        const blob = new Blob([strData], { type: "application/zip" });
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // For IE and Edge
        window.navigator.msSaveBlob(blob, filename);
        } else {
        const link = document.createElement('a');
        if (typeof link.download === 'string') {
            document.body.appendChild(link); // Firefox requires the link to be in the body
            link.download = filename;
            link.href = URL.createObjectURL(blob);
            link.click();
            document.body.removeChild(link); // Remove the link when done
        } else {
            const win = window.open(strData, "_blank");
            win.document.write("<title>" + filename + "</title><img src='" + strData + "'/>");
        }
        }
    }
}