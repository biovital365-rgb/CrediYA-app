export const APP_NAME = "CrediYA";

export const TEXTS = {
  CURRENCY: "Bs.",
  ID_NAME: "Cédula de Identidad",
  ASFI_BADGE: "Supervisado por ASFI", // Updated to correct terminology
  SECURE_BADGE: "Encriptación Bancaria",
  QR_SIMPLE: "QR Simple Bolivia",
};

export const BOLIVIAN_BANKS = [
  { id: 'bnb', name: 'Banco Nacional de Bolivia', color: '#00A550' },
  { id: 'union', name: 'Banco Unión', color: '#0054A6' },
  { id: 'bcp', name: 'Banco de Crédito BCP', color: '#0033A0' },
  { id: 'mercantil', name: 'Banco Mercantil Santa Cruz', color: '#007A33' },
  { id: 'bisa', name: 'Banco Bisa', color: '#009CDC' },
  { id: 'sol', name: 'BancoSol', color: '#D60B52' }, // Microfinance leader mentioned in PDF
];

export const MOCK_PAYMENTS = [
  { id: 1, date: "Lun 20 Oct", amount: 50, status: "PENDING" },
  { id: 2, date: "Lun 27 Oct", amount: 50, status: "PENDING" },
  { id: 3, date: "Lun 03 Nov", amount: 50, status: "PENDING" },
];