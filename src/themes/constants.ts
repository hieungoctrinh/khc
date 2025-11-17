export const ENVIRONMENT = {
  DEV: {
    //pro
    // API_URL: 'https://hagl-be.khc.app'

    //dev
      API_URL: 'https://khc-backend.wowup.asia'
  },
  STAGING: {
    API_URL: ''
  }
}

export const BASE_REQUEST = ENVIRONMENT.DEV

export const PARAMS_LIST = {
  PAGE: 1,
  LIMIT: 20
}

  export const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("vi-VN").format(new Date(dateString));
  };

  export const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    const [hour, minute] = timeString.split(":");
    return `${hour}:${minute}`;
  };
