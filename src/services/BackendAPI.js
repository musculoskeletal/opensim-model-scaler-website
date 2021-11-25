import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_BACKEND_HOST_API,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
  timeout: 60000,
  // Cap the maximum content length we'll accept to 10MBs, just in case
  // This should be matched on the production server as well!
  maxContentLength: 10 * 1024 * 1024,
});

const upload = async (formData, fileName, callbackFunction) => {
  const response = await apiClient.post("upload", formData, {
    onUploadProgress: progressEvent => {
      callbackFunction(progressEvent, fileName);
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const createDemographic = async formData => {
  const response = await apiClient.post("create/demographic", formData);
  return response.data;
};

const createConversion = async data => {
  const response = await apiClient.post("create/conversion", data);
  return response.data;
};

const getAvailableFiles = async () => {
  const response = await apiClient.get("files");
  return response.data;
};

const getAvailableDemographics = async () => {
  const response = await apiClient.get("demographics");
  return response.data;
};

const getAvailableConversions = async file => {
  const response = await apiClient.get("conversions", {
    params: {
      hash: file.hash,
      title: file.title,
    },
  });
  return response.data;
};

const getMarkers = async hash => {
  const response = await apiClient.get("markers/" + hash);
  return response.data;
};

const processData = async (
  file,
  demographic,
  conversion,
  essentialMarkers,
  trackingMarkers
) => {
  const response = await apiClient.post("process", {
    file,
    demographic,
    conversion,
    essentialMarkers,
    trackingMarkers,
  });
  return response.data;
};

const checkJobStatus = async id => {
  const response = await apiClient.get("job/status", {
    params: {
      id,
    },
  });
  return response.data;
};

const removeJob = async id => {
  const response = await apiClient.get("job/remove", {
    params: {
      id,
    },
  });
  return response.data;
};

const listJobs = async () => {
  const response = await apiClient.get("job/list");
  return response.data;
};

const downloadJob = async id => {
  const response = await axios({
    url: process.env.VUE_APP_BACKEND_HOST_API + "/job/download",
    data: {
      id,
    },
    method: "POST",
    responseType: "blob", // important
  });

  return response.data;
};

export {
  checkJobStatus,
  createConversion,
  createDemographic,
  downloadJob,
  getAvailableFiles,
  getAvailableConversions,
  getAvailableDemographics,
  getMarkers,
  listJobs,
  processData,
  removeJob,
  upload,
};
