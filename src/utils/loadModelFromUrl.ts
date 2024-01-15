import * as OBC from 'openbim-components';

export const loadModelFromUrl = (
  scene: THREE.Scene,
  ifcLoader: OBC.FragmentIfcLoader,
  dataModels: string
) => {
  const findNameUrl = (url: string) => {
    //assuming url is divided with /
    const urlParts = url.split('/');
    const urlName = urlParts[urlParts.length - 1];
    return urlName;
  };

  async function loadIfcAsFragments() {
    let url = dataModels;
    try {
      const urlName = findNameUrl(url);
      const file = await fetch(url);
      const data = await file.arrayBuffer();
      const buffer = new Uint8Array(data);
      const model = await ifcLoader.load(buffer, urlName);
      scene.add(model);
      console.log('MODEL_UPDATED', model);
    } catch (error) {
      console.log('error loading file');
    }
  }
  dataModels && loadIfcAsFragments();
};
