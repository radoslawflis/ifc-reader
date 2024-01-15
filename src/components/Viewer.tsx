import {
  useState,
  useEffect,
  useContext,
  useRef,
  MutableRefObject,
} from 'react';
import * as OBC from 'openbim-components';
import * as THREE from 'three';
import { FragmentsGroup } from 'bim-fragment';

import ButtonDownload from './ButtonDownload';
import Interface from './Interface';
import { ModelsContext } from '../context/ModelsContext';
import { addKeyboardCameraControls } from '../keyboardControls/keyboardControls';

import { findPropertiesToExport } from '../utils/findPropertiesToExport';
import { exportAllJsonProperties } from '../utils/exportJson';
import { loadModelFromUrl } from '../utils/loadModelFromUrl';

export default () => {
  const initialSceneModel = new FragmentsGroup();

  const [modelCount, setModelCount] = useState(0);
  const [sceneModel, setSceneModel] = useState(initialSceneModel);
  const [downloadJsonEnabled, setDownloadJsonEnabled] = useState(false);
  // @ts-ignore
  const [selectedElementForJson, setSelectedElementForJson] = useState({});

  const viewerRef: MutableRefObject<OBC.Components | null> =
    useRef<OBC.Components | null>(null);
  const fragmentManagerRef: MutableRefObject<OBC.FragmentManager | null> =
    useRef<OBC.FragmentManager | null>(null);
  const propertiesProcessorRef: MutableRefObject<OBC.IfcPropertiesProcessor | null> =
    useRef<OBC.IfcPropertiesProcessor | null>(null);
  const highlighterRef: MutableRefObject<OBC.FragmentHighlighter | null> =
    useRef<OBC.FragmentHighlighter | null>(null);
  const modelTreeRef: MutableRefObject<OBC.FragmentTree | null> =
    useRef<OBC.FragmentTree | null>(null);
  const mainToolbarRef: MutableRefObject<OBC.Toolbar | null> =
    useRef<OBC.Toolbar | null>(null);

  const { urlModel } = useContext(ModelsContext);

  const handleDownloadAllProps = () => {
    exportAllJsonProperties(sceneModel);
  };

  useEffect(() => {
    // ------------------------------------------------------------Scene--------------------------------------------------------
    const viewer = new OBC.Components();

    const sceneComponent = new OBC.SimpleScene(viewer);
    sceneComponent.setup();
    viewer.scene = sceneComponent;
    const scene = viewer.scene.get();
    scene.background = new THREE.Color(0xffffff);

    // ------------------------------------------------------------Renderer--------------------------------------------------------
    const viewerContainer = document.getElementById(
      'viewerContainer'
    ) as HTMLDivElement;
    const rendererComponent = new OBC.PostproductionRenderer(
      viewer,
      viewerContainer
    );
    viewer.renderer = rendererComponent;
    const postproduction = rendererComponent.postproduction;

    // ------------------------------------------------------------Camera--------------------------------------------------------
    const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer);
    viewer.camera = cameraComponent;
    console.log('Camera', cameraComponent);
    cameraComponent.controls.setLookAt(80, 30, -50, 30, 0, 0);

    // add new controls with KeyArrows
    addKeyboardCameraControls(viewer);

    // ------------------------------------------------------------Raycaster--------------------------------------------------------
    const raycasterComponent = new OBC.SimpleRaycaster(viewer);
    viewer.raycaster = raycasterComponent;

    viewer.init();
    cameraComponent.updateAspect();
    postproduction.enabled = true;
    // ------------------------------------------------------------Grid--------------------------------------------------------
    const grid = new OBC.SimpleGrid(viewer, new THREE.Color(0x999999));
    postproduction.customEffects.excludedMeshes.push(grid.get());

    // ------------------------------------------------------------Navigation Cube--------------------------------------------------------
    const navCube = new OBC.CubeMap(viewer);
    navCube.offset = 1;
    navCube.setPosition('bottom-left');

    // ------------------------------------------------------------Clipper--------------------------------------------------------
    const clipper = new OBC.EdgesClipper(viewer);

    postproduction.customEffects.outlineEnabled = true;
    //creating clipping planes
    viewerContainer.ondblclick = () => clipper.create();

    //deleting clipping planes
    window.onkeydown = (event) => {
      if (event.code === 'Delete' || event.code === 'Backspace') {
        clipper.delete();
      }
    };

    // ------------------------------------------------------------Mini Map Viewer--------------------------------------------------------
    const map = new OBC.MiniMap(viewer);
    viewer.ui.add(map.uiElement.get('canvas'));
    map.lockRotation = false;
    map.zoom = 0.2;

    // ------------------------------------------------------------IFC Loader--------------------------------------------------------
    const fragmentManager = new OBC.FragmentManager(viewer);
    const ifcLoader = new OBC.FragmentIfcLoader(viewer);

    // ---------------------------------Load Test model--------------------------------------------
    loadModelFromUrl(viewer.scene.get(), ifcLoader, '/models/test_model.ifc');

    //add temp button for ModelTree
    const modelTreeTemp = new OBC.Button(viewer);
    modelTreeTemp.materialIcon = 'account_tree';
    modelTreeTemp.tooltip = 'Model tree';

    ifcLoader.onIfcLoaded.add((model) => {
      console.log('UPDATED_SCENE', scene);
      const classifier = new OBC.FragmentClassifier(viewer);

      classifier.byStorey(model);
      classifier.byEntity(model);

      // ---------------------------------------TREE--------------------------------------------

      const updateTree = async () => {
        const modelTree = new OBC.FragmentTree(viewer);
        await modelTree.init();

        //delete fake button of modelTree to add the true one if model is loaded
        mainToolbar.removeChild(mainToolbar.children[4]);

        modelTree.update(['storeys', 'entities']);

        modelTree.onSelected.add((filter) => {
          highlighter.highlightByID('select', filter, true, true);
        });
        modelTree.onHovered.add((filter) => {
          highlighter.highlightByID('hover', filter);
        });

        // if (mainToolbar.children.length < 5) {
        mainToolbar.addChild(modelTree.uiElement.get('main'));

        // }

        if (modelTree) {
          modelTreeRef.current = modelTree;
        }

        console.log('MODEL_TREE', modelTree);
      };
      updateTree();
    });

    // ------------------------------------------------------------Highlighter--------------------------------------------------------
    const highlighter = new OBC.FragmentHighlighter(viewer);
    highlighter.setup();

    const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer);
    highlighter.events.select.onClear.add(() => {
      propertiesProcessor.cleanPropertiesList();
    });

    // ---------------------------Props Finder ----------------------------------------

    const propsFinder = new OBC.IfcPropertiesFinder(viewer);
    const findPropertiesModelQueries = async () => {
      await propsFinder.init();

      propsFinder.onFound.add((result) => {
        highlighter.highlightByID('select', result);
      });

      mainToolbar.addChild(propsFinder.uiElement.get('main'));
    };

    findPropertiesModelQueries();

    // -------------------------------------------------Properties Render---------------------------------
    ifcLoader.onIfcLoaded.add((model) => {
      setModelCount(fragmentManager.groups.length);
      propertiesProcessor.process(model);

      highlighter.events.select.onHighlight.add((selection) => {
        const fragmentID = Object.keys(selection)[0];
        const expressID = Number([...selection[fragmentID]][0]);
        propertiesProcessor.renderProperties(model, expressID);
        // console.log('SELECTION', selection);
      });
      highlighter.update();
      setSceneModel(model);
      setDownloadJsonEnabled(true);

      // -------------------------------------------------------------Fetch Export Properties------------------------------------------

      const fetchPropertiesToExport = async () => {
        try {
          const selectedElementsProperties = await findPropertiesToExport(
            viewer,
            model,
            propertiesProcessor
          );
          setSelectedElementForJson(selectedElementsProperties);
        } catch (error) {
          console.log('Error fetching Properties To export', error);
        }
      };
      fetchPropertiesToExport();
    });

    // Save the viewer instance in the ref
    viewerRef.current = viewer;
    if (fragmentManager) {
      fragmentManagerRef.current = fragmentManager;
    }
    if (propertiesProcessor) {
      propertiesProcessorRef.current = propertiesProcessor;
    }
    if (highlighter) {
      highlighterRef.current = highlighter;
    }

    // ------------------------------------------------------------Toolbar--------------------------------------------------------
    const mainToolbar = new OBC.Toolbar(viewer);
    mainToolbar.addChild(
      ifcLoader.uiElement.get('main'),
      propertiesProcessor.uiElement.get('main'),
      clipper.uiElement.get('main'),
      map.uiElement.get('main'),
      modelTreeTemp
    );
    viewer.ui.addToolbar(mainToolbar);

    if (mainToolbar) {
      mainToolbarRef.current = mainToolbar;
    }
  }, []);

  useEffect(() => {
    if (viewerRef.current !== null) {
      const ifcLoader = new OBC.FragmentIfcLoader(viewerRef.current);

      viewerRef.current &&
        loadModelFromUrl(viewerRef.current.scene.get(), ifcLoader, urlModel);

      const highlighter = new OBC.FragmentHighlighter(viewerRef.current);
      highlighter.setup();

      const propertiesProcessor = new OBC.IfcPropertiesProcessor(
        viewerRef.current
      );
      highlighter.events.select.onClear.add(() => {
        propertiesProcessor.cleanPropertiesList();
      });

      ifcLoader.onIfcLoaded.add((model) => {
        if (propertiesProcessorRef.current !== null) {
          console.log('MODEL_ONIFC_LOADED', model);
          fragmentManagerRef.current &&
            setModelCount(fragmentManagerRef.current.groups.length);
          propertiesProcessorRef.current.process(model);
          highlighter.events.select.onHighlight.add((selection) => {
            const fragmentID = Object.keys(selection)[0];
            const expressID = Number([...selection[fragmentID]][0]);
            if (propertiesProcessorRef.current !== null) {
              propertiesProcessorRef.current.renderProperties(model, expressID);
            }
          });
          highlighter.update();
          setSceneModel(model);
          setDownloadJsonEnabled(true);
        }
        // ------------------------------------------------------Fetch Properties To Export------------------------------------------
        if (viewerRef.current !== null) {
          const fetchPropertiesToExport = async () => {
            try {
              if (
                viewerRef.current !== null &&
                propertiesProcessorRef.current !== null
              ) {
                const selectedElementsProperties = await findPropertiesToExport(
                  viewerRef.current,
                  model,
                  propertiesProcessorRef.current
                );
                setSelectedElementForJson(selectedElementsProperties);
              }
            } catch (error) {
              console.log('Error fetching Properties To export', error);
            }
          };
          fetchPropertiesToExport();
          // ------------------------------------------UPDATE modelTree------------------------------------
          const updateTree = async () => {
            if (viewerRef.current !== null && mainToolbarRef.current !== null) {
              const modelTree = new OBC.FragmentTree(viewerRef.current);
              await modelTree.init();

              //delete fake button of modelTree to add the true one if model is loaded
              console.log('MAINTOOLBAR', mainToolbarRef.current);
              mainToolbarRef.current.removeChild(
                mainToolbarRef.current.children[4]
              );

              modelTree.update(['storeys', 'entities']);

              modelTree.onSelected.add((filter) => {
                highlighter.highlightByID('select', filter, true, true);
              });
              modelTree.onHovered.add((filter) => {
                highlighter.highlightByID('hover', filter);
              });

              mainToolbarRef.current.addChild(modelTree.uiElement.get('main'));
            }
          };
          updateTree();
        }
      });
    }
  }, [urlModel]);

  // ------------------------------------------------------------Styles--------------------------------------------------------
  const viewerContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    gridArea: 'viewer',
  };

  return (
    <>
      <div id='viewerContainer' style={viewerContainerStyle}>
        <Interface modelCount={modelCount} />
        <ButtonDownload
          handleDownload={handleDownloadAllProps}
          downloadJsonEnabled={downloadJsonEnabled}
        />
      </div>
    </>
  );
};
