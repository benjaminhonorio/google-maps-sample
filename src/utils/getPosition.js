const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

const getPosition = (options) => {
  if (navigator.geolocation) {
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, options)
    );
  } else {
    // Browser doesn't support Geolocation
    console.log("Your browser does not support Geolocation");
  }
};

export { options, getPosition };
