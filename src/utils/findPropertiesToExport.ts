import * as OBC from 'openbim-components';
import { FragmentsGroup } from 'bim-fragment';

export const findPropertiesToExport = async (
  viewer: OBC.Components,
  model: FragmentsGroup,
  propertiesProcessor: OBC.IfcPropertiesProcessor
) => {
  const classifier = new OBC.FragmentClassifier(viewer);
  // classifier.byStorey(model);
  classifier.byEntity(model);
  const foundExpressId = await classifier.find({
    entities: ['IFCWALLSTANDARDCASE', 'IFCWALL'],
  });

  //Getting ElemntID of found elements (sets) into one array
  const expressIdArrays = Object.values(foundExpressId).map((set) =>
    Array.from(set)
  );
  // join exsting sets
  const selectedElementsExpressId: string[] = expressIdArrays.reduce(
    (result, currentArray) => [...result, ...currentArray],
    []
  );

  //select Specific elements from properties
  // const selectedElements = selectedElementsExpressId.map(
  //   (item) => model.properties?.[parseInt(item, 10)]
  // );

  const selectedElementsProperties = selectedElementsExpressId.map((element) =>
    propertiesProcessor.getProperties(model, element)
  );

  // console.log('ArrayExpressID', selectedElementsExpressId);

  // console.log('Selected_Properties', selectedElementsProperties);

  return selectedElementsProperties;
};
