import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


/*export const DenseTable1 = () => {
    return ( 
    <TableContainer component={Paper}>
        <Table sx={{minWidth: 250}} size="small" aria-label= 'simple table'>
            <TableHead>
                <TableRow> 
                    <TableCell> </TableCell>
                    <TableCell>Life-Cyle 1</TableCell>
                    <TableCell>Life-Cycle 2</TableCell>
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
                        index === 1 ? 'Input grade' : 
                        index === 2 ? 'CO2-eq' : 
                        index === 3 ? 'CO2-eq grade' : 
                        index === 4 ? 'Type of connection grade' : 
                        index === 5 ? 'Accessibility of connection grade' : 
                        index === 6 ? 'Geometry of product edge grade' : 
                        index === 7 ? 'Output grade':
                        index === 8 ? 'Grade per life-cycle' :
                        index === 9 ? 'Overall grade': ''}
                        </TableCell>
                        <TableCell>{row.LC1}</TableCell>
                        <TableCell>{row.LC2}</TableCell>
                    </TableRow>
                    ))}
            </TableBody>
        </Table>
        </TableContainer>
        )
}

const tableData1 = [{
  //Pick material 
    "Id" : "0",
    "LC1": "Steel",
    "LC2": "Steel",

  }, {
    //Input grade  
    "Id" : "1",
    "LC1": 1.0,
    "LC2": 0.80,

  }, {
    //CO2-eq 
    "Id" : "2", 
    "LC1": 0.33,
    "LC2": 0.50,

  }, {
    //CO2-eq grade
    "Id" : "3",
    "LC1": 0.50,
    "LC2": 0.20,

  }, {
    //Grade type of connection    
    "Id" : "4",
    "LC1": 0.60,
    "LC2": 0.60,

  }, {
    //Grade accessibility of connection    
    "Id" : "5",
    "LC1": 0.80,
    "LC2": 0.80,
  
  }, {
    //Grade geometry of product edge  
    "Id" : "6",
    "LC1": 0.40,
    "LC2": 0.40,

  }, {
    //Output grade  
    "Id" : "7",
    "LC1": 0.60,
    "LC2": 0.60,

  }, {
    //Grade per life-cyle 
    "Id" : "8",
    "LC1": 0.70,
    "LC2": 0.53,

  }, {
    //Overall grade 
    "Id" : "9", 
    "LC1": 0.62,
    "LC2": 0.62,
  }]
*/
