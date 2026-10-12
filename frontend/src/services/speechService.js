import api from './api';

const speechService = {
  transcribe: async (audioBlob, language = 'ta') => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    if (language) {
      formData.append('language', language);
    }

    const response = await api.post('/speech/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    return response.data;
  },
};

export default speechService;
