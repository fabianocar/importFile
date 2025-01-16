import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { uploadExcel } from '../actions/uploadActions';
import './UploadExcel.css';
import * as XLSX from 'xlsx';

const UploadExcel = () => {
  const dispatch = useDispatch();
  const [clientId, setClientId] = useState('');
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({
    name: '',
    birthday: '',
    cpf: '',
    address: '',
    city: '',
    uf: '',
    phone: '',
    holder: '',
    email: '',
    serviceType: '',
    paymentType: ''
  });
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState('');

  const handleClientIdChange = (e) => setClientId(e.target.value);
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
        setHeaders(headers);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleMappingChange = (e, field) => {
    setMapping({ ...mapping, [field]: e.target.value });
  };

  const handleAddField = () => {
    if (selectedField && !fields.includes(selectedField)) {
      setFields([...fields, selectedField]);
      setSelectedField('');
    }
  };

  const handleRemoveField = (field) => {
    setFields(fields.filter(f => f !== field));
    setMapping({ ...mapping, [field]: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientId || !file) {
      alert("Informe o Client ID e selecione um arquivo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target.result.split(',')[1]; // Remove the header from base64 string
      const filteredMapping = Object.fromEntries(
        Object.entries(mapping).filter(([_, value]) => value !== '')
      );
      const payload = {
        clientId,
        fileContent,
        mapping: JSON.stringify(filteredMapping)
      };

      console.log(payload);

      dispatch(uploadExcel(payload));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="upload-container">
      <form onSubmit={handleSubmit}>
        <div className="logo">
          <h1>Rapidoc</h1>
        </div>
        <h2>Upload de Arquivo</h2>
        <div className="form-group">
          <div className="client-id-group">
            <label>Client ID:</label>
            <input type="text" value={clientId} onChange={handleClientIdChange} />
          </div>
          <div className="file-upload-group">
            <label>Excel:</label>
            <label className="custom-file-upload">
              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
              Escolher arquivo
            </label>
          </div>
        </div>
        <h2>Mapeamento de Campos</h2>
        {headers.length > 0 && (
          <div className="headers-container">
            <div className="add-field-container">
              <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)}>
                <option value="">Selecione um campo</option>
                {Object.keys(mapping).filter(field => !fields.includes(field)).map((field) => (
                  <option key={field} value={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</option>
                ))}
              </select>
              <button type="button" onClick={handleAddField} className="add-field-btn">+</button>
            </div>
            <div className="headers-grid">
              {fields.map((field) => (
                <div className="header-item" key={field}>
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                  <div className="field-group">
                    <select value={mapping[field]} onChange={(e) => handleMappingChange(e, field)}>
                      <option value="">Selecione</option>
                      {headers.map((header, index) => (
                        <option key={index} value={index}>{header}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveField(field)}
                      className="remove-field-btn"
                      disabled={!mapping[field]}
                    >
                      -
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <button type="submit" className="submit-btn">Enviar</button>
      </form>
    </div>
  );
};

export default UploadExcel;
