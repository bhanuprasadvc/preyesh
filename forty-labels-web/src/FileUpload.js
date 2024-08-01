import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const FileUpload = ({ onFileLoaded }) => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleFileUpload = () => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target.result;
                if (file.name.endsWith('.xlsx')) {
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                    onFileLoaded(sheet);
                } else if (file.name.endsWith('.csv')) {
                    Papa.parse(data, {
                        header: true,
                        complete: (results) => {
                            onFileLoaded(results.data);
                        }
                    });
                }
            };
            if (file.name.endsWith('.xlsx')) {
                reader.readAsBinaryString(file);
            } else if (file.name.endsWith('.csv')) {
                reader.readAsText(file);
            }
        }
    };

    return (
        <div>
            <input type="file" accept=".xlsx, .csv" onChange={handleFileChange} />
            <button onClick={handleFileUpload}>Upload</button>
        </div>
    );
};

export default FileUpload;
