import { storage } from "../../declarations/storage";

let file;

const uploadChunk = async ({batch_name, chunk}) => storage.create_chunk({
    batch_name,
    content: [...new Uint8Array(await chunk.arrayBuffer())],
})

const upload = async () => {

    if (!file) {
        alert("File not found");
        return;
    }

    console.log("start upload");

    const batch_name = file.name;
    const chunks = [];
    const chunkSize = 1500000

    for (let start = 0; start < file.size; start += chunkSize) {
      const chunk = file.slice(start, start + chunkSize);

      chunks.push(uploadChunk({
        batch_name,
        chunk
      }))
    }

    const chunkIds = await Promise.all(chunks);

    console.log("chunkIds", chunkIds);

    await storage.commit_batch({
        batch_name,
        chunk_ids: chunkIds.map(({chunk_id}) => chunk_id),
        content_type: file.type
    })

    console.log("upload finished");

    loadImage(batch_name);
}

const loadImage = (batch_name) => {

  if (!batch_name) {
    return;
  }

  const newImage = document.createElement("img");
  newImage.src = `http://piwdi-uyaaa-aaaam-qaojq-cai.raw.ic0.app/assets/${batch_name}`;

  const img = document.querySelector('section:last-of-type img');
  img?.parentElement.removeChild(img);

  const section = document.querySelector('section:last-of-type'); 
  section?.appendChild(newImage);
}

const input = document.querySelector('input');
input.addEventListener('change', (e) => {
  file = event.target.files[0];
});

const btnUpload = document.querySelector('button.upload');
btnUpload.addEventListener('click', upload);


