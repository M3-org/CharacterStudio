import AWS from "aws-sdk";
AWS.config.update({
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_ID,
  secretAccessKey: import.meta.env.VITE_AWS_ACCESS_KEY,
  region: import.meta.env.VITE_AWS_REGION
});
export const awsService = { getFileFromS3 };

const s3 = new AWS.S3();

async function getFileFromS3(fileDir: string, fileName: string) {
  const params = {
    Bucket: import.meta.env.VITE_AWS_MODELS_BUCKET_NAME,
    Key: `${fileDir}/${fileName}`,
  };
  const file = s3.getObject(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      return err;
    } else {
      console.log("AWS MODEL: ", data);
      return data.Body
    }
  });
  return await file;
}
