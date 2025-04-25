import { PinataSDK } from 'pinata';

export const PINATA_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiZTZkNDRmZC1mZDVmLTQ2MjMtODlkNy1kZjNmNDUzZjgxYTkiLCJlbWFpbCI6ImdvbGRlbi5kcmFnb24xMDI5MUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYmEyMWNlNTJjYTU2YWQwNjY0ZjkiLCJzY29wZWRLZXlTZWNyZXQiOiJkNTEyMmI4YjUzNjFkOGZjYzBhOGQ0NzI1MmQyYTIxYWI3ODNkYTczMjg2YmI5NDFkYmYwOWFiNTgxYTNjZmFiIiwiZXhwIjoxNzU2MzEzMDkxfQ.Jw60Rc0Z5NURw9zhgriqQc7s4q2RbFY35iOsrp_r5Kc';
export const pinataGateway = 'tan-absent-fox-474.mypinata.cloud';
const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT!,
  pinataGateway: pinataGateway,
});

export const uploadMetaData = async (data: any) => {
  let response = await pinata.upload.json(data);
  return pinataGateway + '/ipfs/' + response.IpfsHash;
};

export const uploadFile = async (file: any) => {
  console.log('upload file');
  const newFile = new File([file], file.name, {
    type: file.type,
    lastModified: file.lastModified,
  });
  let response = await pinata.upload.file(newFile);

  return pinataGateway + '/ipfs/' + response.IpfsHash;
};

export const getData = async (uri: string) => {
  const data = await pinata.gateways.get(uri);
  return data.data;
};
