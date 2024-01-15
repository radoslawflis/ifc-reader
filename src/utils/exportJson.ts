import { FragmentsGroup } from 'bim-fragment';

export const exportJsonWallProperties = async (
  model: FragmentsGroup,
  wallsArray: {}
) => {
  const json = JSON.stringify(wallsArray, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${model.name}`.replace('.ifc', '') + '_IFC_WALLS';
  a.click();
  URL.revokeObjectURL(json);
};

export const exportAllJsonProperties = async (model: FragmentsGroup) => {
  const json = JSON.stringify(model.properties, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${model.name}`.replace('.ifc', '');
  a.click();
  URL.revokeObjectURL(json);
};
