const buildApiUrl = (path) => new URL(path, window.location.origin).toString();

const parseJsonSafely = async (response) => {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
};

const readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read file contents.'));
    reader.readAsText(file);
  });

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read file contents.'));
    reader.readAsDataURL(file);
  });

export const createUploadPayload = async (file) => {
  if (!file) {
    return null;
  }

  const base = {
    name: file.name,
    type: file.type,
    size: file.size,
  };

  if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
    return {
      ...base,
      text: await readFileAsText(file),
    };
  }

  const dataUrl = await readFileAsDataUrl(file);
  const [, base64 = ''] = dataUrl.split(',');

  return {
    ...base,
    base64,
  };
};

const postJson = async (url, payload) => {
  let response;

  try {
    response = await fetch(buildApiUrl(url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(
      'Unable to reach the MedSentinel API. Please make sure `npm run dev:full` is running and refresh the page.'
    );
  }

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
};

const getJson = async (url) => {
  let response;

  try {
    response = await fetch(buildApiUrl(url));
  } catch (error) {
    throw new Error(
      'Unable to reach the MedSentinel API. Please make sure `npm run dev:full` is running and refresh the page.'
    );
  }

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
};

export const loginUser = (name) => postJson('/api/auth/login', { name });

export const analyzePrescription = (payload) => postJson('/api/analyze', payload);

export const askAssistant = (payload) => postJson('/api/chat', payload);

export const fetchAnalysisHistory = (name) =>
  getJson(`/api/history?name=${encodeURIComponent(name)}`);

export const fetchMedications = () => getJson('/api/medications');
