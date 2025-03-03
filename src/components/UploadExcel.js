import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { uploadExcel, UPLOAD_EXCEL_SUCCESS, UPLOAD_EXCEL_FAIL } from '../actions/uploadActions';
import './UploadExcel.css';
import * as XLSX from 'xlsx';
import Modal from 'react-modal';

const UploadExcel = () => {
  const dispatch = useDispatch();
  const [clientId, setClientId] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({
    name: '',
    birthday: '',
    cpf: '',
    address: '',
    city: '',
    uf: '',
    cep: '',
    phone: '',
    holder: '',
    email: '',
    serviceType: '',
    paymentType: ''
  });
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState('');
  const [inactived, setInactived] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [logMessages, setLogMessages] = useState('');

  useEffect(() => {
    // Simulate log messages for testing
    setLogMessages('Simulated log message for testing purposes.');
  }, []);

  const handleClientIdChange = (e) => setClientId(e.target.value);
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
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

    setIsLoading(true);
    setModalMessage('');
    setLogMessages('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target.result.split(',')[1]; // Remove the header from base64 string
      const filteredMapping = Object.fromEntries(
        Object.entries(mapping).filter(([_, value]) => value !== '')
      );
      const payload = {
        clientId,
        fileContent,
        mapping: JSON.stringify(filteredMapping),
        inactived
      };

      console.log(payload);

      dispatch(uploadExcel(payload))
        .then((action) => {
          const { type, payload } = action;
          if (type === UPLOAD_EXCEL_SUCCESS) {
            setModalMessage(payload.message || 'Processamento concluído com sucesso');
            setLogMessages(payload.log || '');
          } else if (type === UPLOAD_EXCEL_FAIL) {
            setModalMessage(payload.message || 'Erro ao processar o arquivo.');
            setLogMessages(payload.log || '');
          }
          setIsLoading(false);
        })
        .catch((err) => {
          const errorData = err.response?.data || {};
          setIsLoading(false);
          setModalMessage(errorData.message || 'Erro ao processar o arquivo.');
          setLogMessages(errorData.log || '');
        });
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Log Messages</title></head><body>');
    printWindow.document.write('<pre>' + logMessages + '</pre>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
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
            <label title="Informe o Client ID">Client ID:</label>
            <input type="text" value={clientId} onChange={handleClientIdChange} title="Informe o Client ID" />
            <div className="file-upload-group">
              <label title="Selecione um arquivo Excel">Excel:</label>
              <label className="custom-file-upload" title="Selecione um arquivo Excel">
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
                Escolher arquivo
              </label>
            </div>
            {fileName && (
              <div className="file-name-display" title="Nome do arquivo selecionado">{fileName}</div>
            )}
          </div>
          <div className="toggle-group">
            <label title="Quando selecionado desativa as vidas">Desativar:</label>
            <label className="toggle-switch" title="Quando selecionado desativa as vidas">
              <input type="checkbox" checked={inactived} onChange={() => setInactived(!inactived)} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
        <h2>Mapeamento de Campos</h2>
        {headers.length > 0 && (
          <div className="headers-container">
            <div className="add-field-container">
              <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)} title="Selecione um campo para adicionar">
                <option value="">Selecione um campo</option>
                {Object.keys(mapping).filter(field => !fields.includes(field)).map((field) => (
                  <option key={field} value={field}>
                    {field === 'cpf' ? 'CPF' : field === 'uf' ? 'UF' : field.charAt(0).toUpperCase() + field.slice(1)}
                  </option>
                ))}
              </select>
              <button type="button" onClick={handleAddField} className="add-field-btn" title="Adicionar campo">+</button>
            </div>
            <div className="headers-grid">
              {fields.map((field) => (
                <div className="header-item" key={field}>
                  <label title={`Mapeamento para ${field === 'cpf' ? 'CPF' : field === 'uf' ? 'UF' : field.charAt(0).toUpperCase() + field.slice(1)}`}>
                    {field === 'cpf' ? 'CPF' : field === 'uf' ? 'UF' : field.charAt(0).toUpperCase() + field.slice(1)}:
                  </label>
                  <div className="field-group">
                    <select value={mapping[field]} onChange={(e) => handleMappingChange(e, field)} title={`Selecione o mapeamento para ${field}`}>
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
                      title="Remover campo"
                    >
                      -
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <button type="submit" className="submit-btn" title="Enviar formulário">Enviar</button>
      </form>
      <Modal
        isOpen={isLoading || modalMessage}
        contentLabel="Processando"
        className="modal"
        overlayClassName="overlay"
      >
        {isLoading && (
          <div className="loading">
            <p>Processando</p>
            <div className="dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
          </div>
        )}
        {modalMessage && (
          <div className="message">
            <p>{modalMessage}</p>
            <button onClick={() => setModalMessage('')}>Fechar</button>
          </div>
        )}
        {logMessages && (
          <>
            <div className="log-messages">
              <pre>{logMessages}</pre>
            </div>
            <button onClick={handlePrint} className="print-btn">Imprimir Logs</button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default UploadExcel;