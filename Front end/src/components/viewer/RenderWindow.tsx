import React, { useEffect, useState} from 'react'
import Console from './Console'
import addMesh from './plugins/addMesh'
import addNavCube from './plugins/addNavCube'
import addViewer from './plugins/addViewer'
import addUserEvents from './plugins/addUserEvents'
import Highlighter from '../../streams/Highlighter'
import addTreeView from './plugins/addTreeView'
// import addFastNav from './plugins/addFastNav'
import addXktLoader from './plugins/addXktLoader'
import './RenderWindow.css'
import addAnnotations from './plugins/addAnnotations'
import { useSettings } from '../../services/useSettings'
import UserSelected from '../../streams/UserSelected'
import ToastrStream from '../../streams/ToastrStream'
import Chart from "chart.js/auto"

import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Grid from '@mui/material/Grid';

import { CategoryScale, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from "chart.js";

//import {InfoGraph, InfoGraphData } from './plugins/addInfoGraph'
import { FaBox } from 'react-icons/fa'
import { Line } from 'react-chartjs-2'
import InfoGraph from './plugins/addInfoGraph-Backup'
import { relative } from 'path'


Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
    );

import { makeStyles } from '@material-ui/core/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button'

export function RenderWindow() {

    const chartRef = {}

    const {
        xktLoader, setXKTloader,
        viewer, setViewer,
        setNavCube, mesh, setMesh,
        setAnnotations,
        model, setModel,
        setXKT,
        picked, setPicked,
        hierarchy,
        treeView, setTreeView,
        autoHighlight, autoExpand,
        isMeshVisible,
    } = useSettings()

const [selectedObjectId, setSelectedObjectId] = useState('');

//ASSESSES THE 3D VIEWER WHETHER AN ELEMENT HAS BEEN HIGHLIGHTED OR NOT
    useEffect(() => {
        if (treeView) {
            if (picked && autoExpand) {
                treeView.showNode(picked)
            } else {
                treeView.unShowNode()
            }
            console.log(treeView.showNode)
        }
        console.log(autoHighlight)//says true if something is highlighted

    }, [treeView, picked])

    useEffect(() => {
        if (treeView) {
            treeView.hierarchy = hierarchy! as any
        } console.log(treeView) //shows the treeview plugin as such
    }, [treeView, hierarchy])


    useEffect(() => {
        if (viewer && treeView) {
            treeView.on('nodeTitleClicked', (e: any) => {
                if (autoHighlight) {
                    const scene = viewer.scene;
                    const objectIds: string[] = [];

                    e.treeViewPlugin.withNodeTree(e.treeViewNode, (treeViewNode: any) => {
                        if (treeViewNode.objectId) {
                            objectIds.push(treeViewNode.objectId);

                            // Log the object ID here
                            console.log('Clicked Object ID:', treeViewNode.objectId);

                            // Set the selectedObjectId state
                            setSelectedObjectId(treeViewNode.objectId);
                        }
                    });

                    scene.setObjectsXRayed(scene.objectIds, true);
                    scene.setObjectsVisible(scene.objectIds, true);
                    scene.setObjectsXRayed(objectIds, false);

                    viewer.cameraFlight.flyTo({
                        aabb: scene.getAABB(objectIds),
                        duration: 0.5
                    }, () => {
                        setTimeout(function () {
                            scene.setObjectsVisible(scene.xrayedObjectIds, false);
                            scene.setObjectsXRayed(scene.xrayedObjectIds, false);
                        }, 500);
                    });
                }
            });
        }
    }, [viewer, treeView, autoHighlight, setSelectedObjectId]);
    
    useEffect(() => {
        const _viewer = addViewer()
        setViewer!(_viewer)
        // addFastNav(_viewer)
        setNavCube!(addNavCube(_viewer))
        setMesh!(addMesh(_viewer))
        const _treeView = addTreeView(_viewer)
        setTreeView!(_treeView)
        addUserEvents!(_viewer)
        setXKTloader!(addXktLoader(_viewer))

        // const distanceMeasurements = new DistanceMeasurementsPlugin(_viewer)
        // distanceMeasurements.control.activate()
        // const storeyViewsPlugin = new StoreyViewsPlugin(_viewer)

        // prevent dragover
        window.addEventListener('dragover', (event: any) =>
            event.preventDefault())

        // drop support
        window.addEventListener('drop', (event: any) => {
            event.preventDefault()
            const file = event.dataTransfer.files[0]
            const reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.onload = (event: any) =>
                setXKT!(event.target.result)
        })

        Highlighter.subscribe(highlight =>
            _viewer.scene.setObjectsHighlighted(highlight, true))

        UserSelected.subscribe(async (item) => {
            setPicked!(item ? item.entity.id : null) // guid of selected element
        })
    }, [])
     useEffect(() => {
        if (xktLoader && viewer) {
            if (model) model.destroy()

            const t0 = performance.now()
            // const params = {
            //     // ... other parameters
            //     projectId: 'YourProjectId', // Assign your project ID here
            //     metaModelData: {
            //         // JSON model metadata
            //         // This should include the necessary metadata for your objects
            //     }
            // };
            try {
                const _model = xktLoader.load({
                    id: 'MyModel' + (new Date().getTime()),
                    src: './smallBridgeModel.xkt',
                    edges: true,
                    // metaModelData: params.metaModelData
                })
                _model.on('loaded', () => {
                    mesh!.position = [viewer.scene.center[0], 0, viewer.scene.center[2]]
                    viewer.cameraFlight.flyTo(_model.aabb as any)

                    const t1 = performance.now()
                    console.log(`Loading time: ${Math.floor(t1 - t0)} ms`)
                    ToastrStream.next({
                        title: 'XKT Loaded',
                        message: `Loading time: ${Math.floor(t1 - t0)} ms`
                    })
                    setModel!(_model)
                    const _annotations = addAnnotations(viewer)
                    setAnnotations!(_annotations)
                })
            } catch (error) {
                console.error(`Error loading xkt file ${error}`)
            }
        }
    }, [xktLoader])

    useEffect(() => {
        if (mesh) {
            mesh.visible = isMeshVisible!
        }
    }, [isMeshVisible])

//INPUT COMPONENT
    const [selectedInputName1, setSelectedInputName1] = useState('');
    const [selectedInputValue1, setSelectedInputValue1] = useState(0);

const inputOptions1 = [
    { label: 'Primary non renewable', value: '0.1' },
    { label: 'Primary renewable unsustainable', value: '0.4' },
    { label: 'Primary renewable sustainable', value: '0.6' },
    { label: 'Secondary recycling', value: '0.8' },
    { label: 'Secondary reuse', value: '1.0' },
];
    
const handleChangeInput1 = (event: any) => {
    const selectedInputOption1 = inputOptions1.find(option => option.label === event.target.value);
    setSelectedInputName1(event.target.value);
    if (selectedInputOption1) {
    setSelectedInputValue1(parseFloat(selectedInputOption1.value));
    }
};
  //console.log('test', selectedInputValue)

  const [selectedInputName2, setSelectedInputName2] = useState('');
  const [selectedInputValue2, setSelectedInputValue2] = useState(0);

const inputOptions2 = [
  { label: 'Primary non renewable', value: '0.1' },
  { label: 'Primary renewable unsustainable', value: '0.4' },
  { label: 'Primary renewable sustainable', value: '0.6' },
  { label: 'Secondary recycling', value: '0.8' },
  { label: 'Secondary reuse', value: '1.0' },
];
  
const handleChangeInput2 = (event: any) => {
  const selectedInputOption2 = inputOptions2.find(option => option.label === event.target.value);
  setSelectedInputName2(event.target.value);
  if (selectedInputOption2) {
  setSelectedInputValue2(parseFloat(selectedInputOption2.value));
  }
};
//console.log('test', selectedInputValue)

//ENVIRONMENTAL IMPACT COMPONENT
const [material, setMaterial] = useState('');
const [materialValues, setMaterialValues] = useState<{ id: string; material: string }[]>([]);
//const [selectedMaterialId, setSelectedMaterialId] = useState('');

const [environmentalImpact, setEnvironmentalImpact] = useState('');
const [environmentalImpactValues, setEnvironmentalImpactValues] = useState<{ material: string; EIgrade: number }[]>([]);
//const [selectedEnvironmentalImpactId, setSelectedEnvironmentalImpactId] = useState('');

const [co2eq, setCo2eq] = useState('');
const [co2eqValues, setCo2eqValues] = useState<{ material: string; co2eq: number }[]>([]);
//const [selectedCo2eqId, setSelectedCo2eqId] = useState('');

const [density, setDensity] = useState('')
const [densityValues, setDensityValues] = useState<{ material: string; density: number }[]>([]);
//const [selectedDensityId, setSelectedDensityId] = useState('');

//COMMAND TO START SERVER
//json-server --watch data/db.json --port 8000

//Fetch MaterialInstance from JSON server
useEffect(() => {
    fetch('http://localhost:8000/data')
    .then((res) => res.json())
    .then((data) => {
        setMaterialValues(
            data.data.map((item: any) => ({ id: item.id, material: item.material}))
        )
        setEnvironmentalImpactValues(
            data.data.map((item: any) => ({ material: item.material, EIgrade : item.EIgrade}))
        )
        setCo2eqValues(
            data.data.map((item: any) => ({ material: item.material, co2eq : item.co2eq}))
        )
        setDensityValues(
            data.data.map((item: any) => ({ material: item.material, density : item.density}))
        )
        //console.log('Material data:', data.data);
        })
        .catch((err) => {
        console.log('Error fetching the material', err.message);
        });
        //console.log(environmentalImpactValues)
        //console.log(co2eqValues)
        //console.log(densityValues)

}, [material, 
    environmentalImpact, 
    co2eq, 
    materialValues, 
    //selectedMaterialId, 
    environmentalImpactValues, 
    //selectedEnvironmentalImpactId,
    density, 
    densityValues, 
    //selectedDensityId
]);

//Select material for LC1
//const [selectedMaterialValue1, setSelectedMaterialValue1] = useState('')
const [selectedMaterial1, setSelectedMaterial1] = useState<string>('')
//const [selectedEnvironmentalImpactId, setSelectedEnvironmentalImpactId] = useState<string | null>(null);
const [selectedEnvironmentalImpactValue1, setSelectedEnvironmentalImpactValue1] = useState<number>(0)
const [selectedCo2eqId1, setSelectedCo2eqId1] = useState<number>(0);
const [selectedDensityId1, setSelectedDensityId1] = useState<number>(0);



const handleChangeMaterial1 = (event: SelectChangeEvent) => {
    const materialId = event.target.value;
    const selectedMaterial = materialValues.find((m) => m.material === materialId);
    const selectedEnvironmentalImpact1 = environmentalImpactValues.find((e) => e.material === materialId);
    const selectedCo2eq = co2eqValues.find((e) => e.material === materialId);
    const selectedDensity = densityValues.find((d) => d.material === materialId);
    

        if (selectedMaterial) {
            setSelectedMaterial1(selectedMaterial?.material || '');
        }      
        if (selectedEnvironmentalImpact1) {
            setSelectedEnvironmentalImpactValue1(selectedEnvironmentalImpact1.EIgrade);
            }       
        if (selectedCo2eq) {
            setSelectedCo2eqId1(selectedCo2eq.co2eq);
          }
        if (selectedDensity) {
            setSelectedDensityId1(selectedDensity.density);
        }
    }

    const [materialsLC2, setMaterialsLC2] = useState<string[]>([]);

    useEffect(() => {
        if (selectedMaterial1) {
          const firstWord = selectedMaterial1.split(' ')[0];
          const filteredMaterialsLC2 = materialValues
            .filter((material: { material: string }) => material.material.startsWith(firstWord))
            .map((material) => material.material);
          setMaterialsLC2(filteredMaterialsLC2);
        }
      }, [selectedMaterial1, materialValues]);

    //Select material for LC2
    const [selectedMaterial2, setSelectedMaterial2] = useState('')
    const [selectedEnvironmentalImpactValue2, setSelectedEnvironmentalImpactValue2] = useState<number>(0)
    const [selectedCo2eqId2, setSelectedCo2eqId2] = useState<number>(0);
    const [selectedDensityId2, setSelectedDensityId2] = useState<number>(0);

    const handleChangeMaterial2 = (event: SelectChangeEvent) => {
        const materialId = event.target.value;
        const selectedMaterial = materialValues.find((m) => m.material === materialId);
        const selectedEnvironmentalImpact = environmentalImpactValues.find((e) => e.material === materialId);
        const selectedCo2eq = co2eqValues.find((e) => e.material === materialId);
        const selectedDensity = densityValues.find((d) => d.material === materialId);
    
            if (selectedMaterial) {
                setSelectedMaterial2(selectedMaterial.material.toString());
            }      
            if (selectedEnvironmentalImpact) {
                setSelectedEnvironmentalImpactValue2(selectedEnvironmentalImpact.EIgrade);
                }       
            if (selectedCo2eq) {
                setSelectedCo2eqId2(selectedCo2eq.co2eq);
              }
            if (selectedDensity) {
                setSelectedDensityId2(selectedDensity.density);
            }
        }

//Volume in LC1
const [volume1, setVolume1] = useState<number>(0);

useEffect(() => {
    const fetchData = async () => {
        if (!picked) {
            return;
        }
        try {
            //console.log('logging before fetching', picked);
            const response = await fetch(`http://localhost:4000/property-sets/volume/${picked}`);
            const responseData = await response.json();
            const { data } = responseData.data;
            //console.log('Volume value', data.volume);
            const roundedAverage = parseFloat(data.volume.toFixed(4))
            setVolume1(roundedAverage)
        } catch (err: any) {
            console.error('Error fetching data:', err.message);
        }
    };
    fetchData();
}, [picked]);
//console.log('volume1', volume1)

//Volume in LC2
const [volume2, setVolume2] = useState<number>(0);

useEffect(() => {
    const fetchData = async () => {
        if (!picked) {
            return;
        }
        try {
            //console.log('logging before fetching', picked);
            const response = await fetch(`http://localhost:4000/property-sets/volume/${picked}`);
            const responseData = await response.json();
            const { data } = responseData.data;
            console.log('Volume value', data.volume);
            const roundedAverage = parseFloat(data.volume.toFixed(4))
            setVolume2(roundedAverage)
        } catch (err: any) {
            console.error('Error fetching data:', err.message);
        }
    };
    fetchData();
}, [picked]);

//OUTPUT COMPONENT
//Type of connection
const typeOptions = [
{ label: 'Accessory external connection (system)', value: '1.0' },
{ label: 'Connection with added fixing devices', value: '0.8' },
{ label: 'Direct integral connection with inserts', value: '0.6' },
{ label: 'Direct integral connection', value: '0.5' },
{ label: 'Accessory internal connection', value: '0.4' },
{ label: 'Filled soft chemical connection', value: '0.2' },
{ label: 'Filled hard chemical connection', value: '0.1' },
{ label: 'Direct chemical connection', value: '0.1' },
];

//LC1
const [selectedTypeName1, setSelectedTypeName1] = useState('');
const [selectedTypeValue1, setSelectedTypeValue1] = useState(Number);

const handleChangeType1 = (event: any) => {
    const selectedTypeOption1 = typeOptions.find(option => option.label === event.target.value);
    setSelectedTypeName1(event.target.value);
    if (selectedTypeOption1) {
    setSelectedTypeValue1(parseFloat(selectedTypeOption1.value));
    }
    };
//console.log('test', selectedTypeValue1)

//LC2
const [selectedTypeName2, setSelectedTypeName2] = useState('');
const [selectedTypeValue2, setSelectedTypeValue2] = useState(Number);

const handleChangeType2 = (event: any) => {
    const selectedTypeOption2 = typeOptions.find(option => option.label === event.target.value);
    setSelectedTypeName2(event.target.value);
    if (selectedTypeOption2) {
    setSelectedTypeValue2(parseFloat(selectedTypeOption2.value));
    }
    };
    //console.log('test', selectedTypeValue1)

    //Accessibility of connection
const accessibilityOptions = [
{ label: 'Accessible without additional operation', value: '1.0' },
{ label: 'Additional operation, no damage', value: '0.8' },
{ label: 'Additional operation, reparable damage', value: '0.6' },
{ label: 'Additional operation, causes damage', value: '0.4' },
{ label: 'Not accessible, total damage to elements', value: '0.1' },
];

//LC1
const [selectedAccessibilityName1, setSelectedAccessibilityName1] = useState('');
const [selectedAccessibilityValue1, setSelectedAccessibilityValue1] = useState(Number);

const handleChangeAccessibility1 = (event: any) => {
    const selectedAccessibilityOption1 = accessibilityOptions.find(option => option.label === event.target.value);
    setSelectedAccessibilityName1(event.target.value);
    if (selectedAccessibilityOption1) {
    setSelectedAccessibilityValue1(parseFloat(selectedAccessibilityOption1.value));
    }
    };

//LC2
const [selectedAccessibilityName2, setSelectedAccessibilityName2] = useState('');
const [selectedAccessibilityValue2, setSelectedAccessibilityValue2] = useState(Number);

const handleChangeAccessibility2 = (event: any) => {
    const selectedAccessibilityOption2 = accessibilityOptions.find(option => option.label === event.target.value);
    setSelectedAccessibilityName2(event.target.value);
    if (selectedAccessibilityOption2) {
    setSelectedAccessibilityValue2(parseFloat(selectedAccessibilityOption2.value));
    }
    };

//Geometry of product edge
const geometryOptions = [
    { label: 'Open linear', value: '1.0' },
    { label: 'Symmetrical overlapping', value: '0.8' },
    { label: 'Overlapping on one side', value: '0.7' },
    { label: 'Unsymmetrical overlapping', value: '0.4' },
    { label: 'Insert on one side', value: '0.2' },
    { label: 'Insert in two sides', value: '0.1' },
    ];

//LC1
const [selectedGeometryName1, setSelectedGeometryName1] = useState('');
const [selectedGeometryValue1, setSelectedGeometryValue1] = useState(Number);

const handleChangeGeometry1 = (event: any) => {
    const selectedGeometryOption1 = geometryOptions.find(option => option.label === event.target.value);
    setSelectedGeometryName1(event.target.value);
    if (selectedGeometryOption1) {
    setSelectedGeometryValue1(parseFloat(selectedGeometryOption1.value));
    }
    };

//LC2
const [selectedGeometryName2, setSelectedGeometryName2] = useState('');
const [selectedGeometryValue2, setSelectedGeometryValue2] = useState(Number);

const handleChangeGeometry2 = (event: any) => {
    const selectedGeometryOption2 = geometryOptions.find(option => option.label === event.target.value);
    setSelectedGeometryName2(event.target.value);
    if (selectedGeometryOption2) {
    setSelectedGeometryValue2(parseFloat(selectedGeometryOption2.value));
    }
    };

//CALCUALTION
//LC1 output average grade
const [outputAverage1, setOutputAverage1] = useState<number>(0);  
useEffect(() => {
    const sum = selectedTypeValue1 + selectedAccessibilityValue1 + selectedGeometryValue1;
    const average = sum / 3;
    setOutputAverage1(average);
    const roundedAverage = parseFloat(average.toFixed(2))
    setOutputAverage1(roundedAverage)
}, [selectedTypeValue1, selectedAccessibilityValue1, selectedGeometryValue1]);
//console.log('Average output value:', outputAverage1)

//LC2 output average grade
const [outputAverage2, setOutputAverage2] = useState<number>(0);  
useEffect(() => {
    const sum = selectedTypeValue2 + selectedAccessibilityValue2 + selectedGeometryValue2;
    const average = sum / 3;
    setOutputAverage2(average);
    const roundedAverage = parseFloat(average.toFixed(2))
    setOutputAverage2(roundedAverage)
}, [selectedTypeValue2, selectedAccessibilityValue2, selectedGeometryValue2]);

//LC1 grading
const [lifeCycleGrade1, setLifeCycleGrade1] = useState<number>(0);  
useEffect(() => {
    const sum = selectedInputValue1 + selectedEnvironmentalImpactValue1 + outputAverage1;
    const average = sum / 3;
    setLifeCycleGrade1(average);
    const roundedAverage = parseFloat(average.toFixed(2))
    setLifeCycleGrade1(roundedAverage)
}, [selectedInputValue1, selectedEnvironmentalImpactValue1, outputAverage1]);
//console.log('LC1 grade:', lifeCycleGrade1)

//LC2 grading
const [lifeCycleGrade2, setLifeCycleGrade2] = useState<number>(0);  
useEffect(() => {
    const sum = selectedInputValue2 + selectedEnvironmentalImpactValue2 + outputAverage2;
    const average = sum / 3;
    setLifeCycleGrade2(average);
    const roundedAverage = parseFloat(average.toFixed(2))
    setLifeCycleGrade2(roundedAverage)
}, [selectedInputValue2, selectedEnvironmentalImpactValue2, outputAverage2]);

//Overall circularity assessment
const [overallGrading, setOverallGrading] = useState<number>(0);  
useEffect(() => {
    const sum = lifeCycleGrade1 + lifeCycleGrade2;
    const average = sum / 2;
    setOverallGrading(average);
    const roundedAverage = parseFloat(average.toFixed(2))
    setOverallGrading(roundedAverage)
}, [lifeCycleGrade1, lifeCycleGrade2]);

const pickedId = picked;

const handleExport = () => {
    // Create headers for the CSV
    const headers = ['Picked Id', 'Id', 'Life-Cycle 1', 'Life-Cycle 2'];
    
    // Convert tableData1 to CSV format
    const tableDataCSV = [headers.join(',')];
    tableData1.forEach(row => {
      const rowData = [row.Id, row.LC1, row.LC2];
      tableDataCSV.push(rowData.join(','));
    });
  
    // Add Circular values to the CSV
    const circularValues = [
        ['','',''],
        ['Picked Id', pickedId],
        ['Circular value of selected element',overallGrading.toFixed(2)],
        ['Circular value of construction', constructionGrading.toFixed(2)]
      ];
  
    // Combine tableData and circularValues
    const combinedCSV: string[] = [...tableDataCSV, ...circularValues.map(row => row.join(','))];
  
    // Create a Blob
    const blob = new Blob([combinedCSV.join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
  
    // Create a download link
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'exported_data.csv';
  
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  interface TableRow {
    Id: string;
    LC1: string | number;
    LC2: string | number;
}

  const generateHTMLTable = (data: TableRow[]) => {
    let html = '<table border="1">';
    html += '<tr><th>Id</th><th>Life-Cycle 1</th><th>Life-Cycle 2</th></tr>';
    data.forEach(row => {
        html += `<tr><td>${row.Id}</td><td>${row.LC1}</td><td>${row.LC2}</td></tr>`;
    });
    html += '</table>';
    return html;
};

const handleExport2 = () => {
    // Create headers for the CSV
    const csvHeaders = ['Picked Id', 'Id', 'Life-Cycle 1', 'Life-Cycle 2'];
    
    // Convert tableData1 to CSV format
    const tableDataCSV = [csvHeaders.join(',')];
    tableData1.forEach(row => {
        const rowData = [row.Id, row.LC1, row.LC2];
        tableDataCSV.push(rowData.join(','));
    });

    // Generate HTML table
    const htmlTable = generateHTMLTable(tableData1);

    // Add Circular values to the CSV
    const circularValues = [
        ['Picked Id:', pickedId],
        ['Circular value of selected element:',overallGrading.toFixed(2)],
        ['Circular value of construction:', constructionGrading.toFixed(2)]
    ];

    // Combine tableData and circularValues for CSV
    const combinedCSV = [...tableDataCSV, ...circularValues.map(row => row.join(','))];

    // Combine HTML table and circularValues for HTML content
    const htmlContent = htmlTable + '<br><br>' + circularValues.map(row => row.join('&nbsp;&nbsp;&nbsp;')).join('<br>');

    // Create Blobs for CSV and HTML
    const csvBlob = new Blob([combinedCSV.join('\n')], {
        type: 'text/csv;charset=utf-8',
    });

    const htmlBlob = new Blob([htmlContent], {
        type: 'text/html;charset=utf-8',
    });

    // Create download links
    const csvLink = document.createElement('a');
    csvLink.href = window.URL.createObjectURL(csvBlob);
    csvLink.download = 'exported_data.csv';

    const htmlLink = document.createElement('a');
    htmlLink.href = window.URL.createObjectURL(htmlBlob);
    htmlLink.download = 'exported_data.html';

    // Trigger the downloads
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);

    document.body.appendChild(htmlLink);
    htmlLink.click();
    document.body.removeChild(htmlLink);
};


//TABLE COMPONENT
const tableData1 = [{
    //Pick material 
      "Id" : "Material",
      "LC1": selectedMaterial1,
      "LC2": selectedMaterial2,
    }, {
      //Density   
      "Id" : "Density",
      "LC1": selectedDensityId1 + " kg/m3",
      "LC2": selectedDensityId2 + " kg/m3",
    }, {
      //Volume   
      "Id" : "Volume",
      "LC1": volume1 + " m3",
      "LC2": volume2 + " m3",
    }, {
      //CO2-eq 
      "Id" : "CO2-eq",
      "LC1": selectedCo2eqId1 + " kg CO2/kg",
      "LC2": selectedCo2eqId2 + " kg CO2/kg",
    }, {
      //Input grade 
      "Id" : "Input grade", 
      "LC1": selectedInputValue1,
      "LC2": selectedInputValue2,
    }, {
      //Environmental Impact grade
      "Id" : "Environmental impact grade",
      "LC1": selectedEnvironmentalImpactValue1,
      "LC2": selectedEnvironmentalImpactValue2,
    }, {
      //Grade type of connection    
      "Id" : "Type of connectio grade",
      "LC1": selectedTypeValue1,
      "LC2": selectedTypeValue2,
    }, {
      //Grade accessibility of connection    
      "Id" : "Accessibility of connection grade",
      "LC1": selectedAccessibilityValue1,
      "LC2": selectedAccessibilityValue2,
    }, {
      //Grade geometry of product edge  
      "Id" : "Geometry of product edge grade",
      "LC1": selectedGeometryValue1,
      "LC2": selectedGeometryValue2,
    }, {
      //Output grade  
      "Id" : "Output grade",
      "LC1": outputAverage1,
      "LC2": outputAverage2,
    }, {
      //Grade per life-cyle 
      "Id" : "Grade per life-cycle",
      "LC1": lifeCycleGrade1,
      "LC2": lifeCycleGrade2,
    }]

//Hardcoded example input for elements
const railingDensity = 7850
const railingVolume = 0.0309
const edgeElementDensity = 7850
const edgeElementVolume = 0.088
const abutmentDensity = 2500
const abutmentVolume = 15.423
const bridgeDeckDensity = 2500
const bridgeDeckVolume = 21.132

const totalRailing = railingDensity * railingVolume * 10
const totalEdgeElement = edgeElementDensity * edgeElementVolume
const totalAbutment = abutmentDensity * abutmentVolume * 2
const totalBridgeDeck = bridgeDeckDensity * bridgeDeckVolume

//Calculate selected element mass
const selectedMass = volume1 * selectedDensityId1
const selectedElementGrading = overallGrading * selectedMass

const [constructionGrading, setConstructionGrading] = useState<number>(0);
const [massPercentage, setMassPercentage] = useState<number>(0);
  
useEffect(() => {
    const sum = totalRailing * 1.0 + totalEdgeElement * 0.75 + totalAbutment * 0.4 + totalBridgeDeck * 0.88 + selectedElementGrading;
    const sumFactor = totalRailing + totalEdgeElement + totalAbutment + totalBridgeDeck + selectedMass
    console.log('total mass', sumFactor)
    const average = sum / sumFactor;
    console.log('Construction grading:', average )
    const roundedAverage = parseFloat(average.toFixed(2))
    setConstructionGrading(roundedAverage)
    const percentage = selectedMass / sumFactor * 100
    setMassPercentage(percentage)
}, [railingDensity, railingVolume, edgeElementDensity, edgeElementVolume, volume1, selectedDensityId1, overallGrading, selectedMass]);
//console.log('test', constructionGrading)
//calculate mass percentage


const getColor = (value: any) => {
    if (value < 0.4) return 'red';
    if (value >= 0.4 && value <= 0.6) return 'orange';
    return 'green';
  };
 
    return (
        <div id='RenderWindow'>
            <canvas id='myCanvas'></canvas>
            <canvas id='myNavCubeCanvas' ></canvas>
            <div id='treeViewContainer'></div>
            <div id='treeViewContainer2'>
                <div>
                    <h3 style={{fontSize: '20px', fontWeight: 'bold', color: 'black'}}>Circularity Assessment LC1</h3>
                        <div >
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="demo-simple-select-standard-label">Material</InputLabel>
                            <Select
                                labelId="demo-simple-select-standard-label"
                                id="demo-simple-select-standard"
                                defaultValue = ""
                                value={selectedMaterial1}
                                onChange={handleChangeMaterial1}
                            >
                                {materialValues.map((material) => (
                                    <MenuItem key={material.id} value={material.material}>
                                        {material.material}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="input">Input</InputLabel>
                            <Select 
                                labelId="input"
                                id="input"
                                value={selectedInputName1} 
                                label="Input"   
                                onChange={handleChangeInput1}>
                                    {inputOptions1.map(option => (
                                    <MenuItem key={option.value} value={option.label}>
                                        {option.label}
                                    </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="Type of connection">Type of connection</InputLabel>
                            <Select 
                                labelId="Type of connection"
                                id="Type of connection"
                                value={selectedTypeName1} 
                                label="Type of connection"   
                                onChange={handleChangeType1}>
                                    {typeOptions.map(option => (
                                    <MenuItem key={option.value} value={option.label}>
                                        {option.label}
                                    </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="Accessibility of connection">Accessibility of connection</InputLabel>
                            <Select 
                                labelId="Accessibility of connection"
                                id="Accessibility of connection"
                                value={selectedAccessibilityName1} 
                                label="Accessibility of connection"   
                                onChange={handleChangeAccessibility1}>
                                    {accessibilityOptions.map(option => (
                                    <MenuItem key={option.value} value={option.label}>
                                        {option.label}
                                    </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="Geometry of product edge">Geometry of product edge</InputLabel>
                            <Select 
                                labelId="Geometry of product edge"
                                id="Geometry of product edge"
                                value={selectedGeometryName1} 
                                label="Geometry of product edge"   
                                onChange={handleChangeGeometry1}>
                                    {geometryOptions.map(option => (
                                    <MenuItem key={option.value} value={option.label}>
                                        {option.label}
                                    </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </div>
                    <h3 style={{fontSize: '20px', fontWeight: 'bold', color: 'black'}}>Circularity Assessment LC2</h3>    
                    <div >
                    <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="demo-simple-select-standard-label">Material</InputLabel>
                    <Select
                        labelId="demo-simple-select-standard-label"
                        id="demo-simple-select-standard"
                        value={selectedMaterial2}
                        label="Material"
                        onChange={handleChangeMaterial2}
                    >
                        {materialsLC2.map((material) => (
                        <MenuItem key={material} value={material}>
                            {material}
                        </MenuItem>
                        ))}
                    </Select>
                    </FormControl>
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="input">Input</InputLabel>
                            <Select 
                                labelId="input"
                                id="input"
                                value={selectedInputName2} 
                                label="Input"   
                                onChange={handleChangeInput2}>
                                    {inputOptions2.map(option => (
                                    <MenuItem key={option.value} value={option.label}>
                                        {option.label}
                                    </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="Type of connection">Type of connection</InputLabel>
                            <Select 
                                labelId="Type of connection"
                                id="Type of connection"
                                value={selectedTypeName2} 
                                label="Type of connection"   
                                onChange={handleChangeType2}>
                                    {typeOptions.map(option => (
                                    <MenuItem key={option.value} value={option.label}>
                                        {option.label}
                                    </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="Accessibility of connection">Accessibility of connection</InputLabel>
                            <Select 
                                labelId="Accessibility of connection"
                                id="Accessibility of connection"
                                value={selectedAccessibilityName2} 
                                label="Accessibility of connection"   
                                onChange={handleChangeAccessibility2}>
                                    {accessibilityOptions.map(option => (
                                    <MenuItem key={option.value} value={option.label}>
                                        {option.label}
                                    </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="Geometry of product edge">Geometry of product edge</InputLabel>
                            <Select 
                                labelId="Geometry of product edge"
                                id="Geometry of product edge"
                                value={selectedGeometryName2} 
                                label="Geometry of product edge"   
                                onChange={handleChangeGeometry2}>
                                    {geometryOptions.map(option => (
                                    <MenuItem key={option.value} value={option.label}>
                                        {option.label}
                                    </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </div>
                </div>
                    <h4 style={{fontSize: '20px', color: 'black', fontWeight: 'bold' }}>Component properties</h4>
                    <h5 style={{fontSize: '15px', color: 'black'}}> 
                    The selected element accounts for {massPercentage.toFixed(1)}% of the total mass of the construction.
                    </h5>
                    <TableContainer component={Paper}>
                        <Table sx={{minWidth: 250}} size="small" aria-label= 'simple table'>
                            <TableHead>
                                <TableRow> 
                                    <TableCell> </TableCell>
                                    <TableCell style={{ fontWeight: "bold" }}>Life-Cycle 1</TableCell>
                                    <TableCell style={{ fontWeight: "bold" }}>Life-Cycle 2</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tableData1.map((row, index) => (
                                    <TableRow 
                                        key={row.Id} 
                                        sx={{'&:last-child td, &:last-child th': { border: 0},  height: '0px'}}
                                    >
                                        <TableCell>
                                        {index === 0 ? 'Material' : 
                                        index === 1 ? 'Density' : 
                                        index === 2 ? 'Volume' : 
                                        index === 3 ? 'CO2-eq' : 
                                        index === 4 ? 'Input grade' : 
                                        index === 5 ? 'Environmental impact grade' : 
                                        index === 6 ? 'Type of connection grade' : 
                                        index === 7 ? 'Accessibility of connection grade' : 
                                        index === 8 ? 'Geometry of product edge grade' : 
                                        index === 9 ? 'Output grade':
                                        index === 10 ? 'Grade per life-cycle' :
                                        index === 11 ? 'Overall grade': ''}
                                        </TableCell>
                                        <TableCell
                                            style={{
                                                color:
                                                    index < 4
                                                    ? 'black'
                                                    : parseFloat(row.LC1.toString()) < 0.4
                                                    ? 'red'
                                                    : parseFloat(row.LC1.toString()) >= 0.4 &&
                                                    parseFloat(row.LC1.toString()) < 0.6
                                                    ? 'orange'
                                                    : 'green'
                                          }}
                                        >
                                          {row.LC1}
                                        </TableCell>
                                        <TableCell
                                            style={{
                                                color:
                                                    index < 4
                                                    ? 'black'
                                                    : parseFloat(row.LC2.toString()) < 0.4
                                                    ? 'red'
                                                    : parseFloat(row.LC2.toString()) >= 0.4 &&
                                                    parseFloat(row.LC2.toString()) <= 0.6
                                                    ? 'orange'
                                                    : 'green'
                                          }}
                                        >
                                          {row.LC2}
                                        </TableCell>
                                    </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Button variant="contained" color="primary" onClick={handleExport}>
                    Export Data as .CSV
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleExport2}>
                    Export Data as HTML
                    </Button>
                    <h4 style={{ fontSize: '20px', color: 'black', fontWeight: 'bold' }}>
                        Circular value of selected element: {''}
                        {overallGrading !== null && (
                            <span style={{ color: getColor(overallGrading), fontWeight: 'bold', fontSize: '20px' }}>
                                {overallGrading.toFixed(2)}
                            </span>
                        )}
                    </h4>      
                    <h5 style={{ fontSize: '20px', color: 'black', fontWeight: 'bold' }}>
                        Circular value of construction: {''}
                        {constructionGrading !== null && (
                            <span style={{ color: getColor(constructionGrading), fontWeight: 'bold', fontSize: '20px' }}>
                                {constructionGrading.toFixed(2)}
                            </span>
                        )}
                    </h5>                    
                    <div style={{ display: "flex"}}>
                    <h6 style={{ fontSize: '20px', marginTop: '2px', color: 'black', fontWeight: 'bold'  }}>Compressed ID:</h6>
                    <Console style={{ color: 'black', fontWeight: 'bold' }} />;                    </div>                    
                    <div>
                    <div id='treeRow'>
                    </div>
                </div>
            </div>
            <div id='treeViewContainer4'>
                    <h6 style={{ fontSize: '20px', color: 'black', fontWeight: 'bold'  }}>Legend</h6>
                    <ul style={{ listStyleType: 'none', padding: 0}}>
                    <li style={{ color: 'black'}}>The grading reaches from 0.1 up to 1.0:</li>
                    <li>
                        <span style={{ color: 'red', fontWeight: 'bold' }}>Red:</span> 
                        <span style={{ color: 'black' }}> Less than 0.4, defined as a linear object. </span>
                    </li>
                    <li>
                        <span style={{ color: 'orange', fontWeight: 'bold' }}>Orange:</span> 
                        <span style={{ color: 'black' }}> From 0.4 to 0.6, linear with circular aspects.</span>
                    </li>
                    <li>
                        <span style={{ color: 'green', fontWeight: 'bold' }}>Green:</span> 
                        <span style={{ color: 'black' }}> Greater than 0.6, defined as a circular object.</span>
                    </li>
                    <li style={{ color: 'black', fontSize: '12px' }}>*Color coding for "Circular value of selected element" and "Circular value of construction" might differ due to rounding off</li>
                    <li style={{ color: 'black', fontSize: '12px' }}>*All drop-down menu's should have a selected value to display a correct grading</li>
                    </ul>
            </div>
            <div id='treeViewContainer5'>
            <div>

            </div>
            </div>
            <div id='treeViewContainer3'>
            </div>
            <div>
            <div>        
            </div>
        </div>
        </div>
    )
}
