import { createCustomEqual } from "fast-equals"; // para hacer comparativas de objetos
import {
  useState,
  useEffect,
  useRef,
  Children,
  isValidElement,
  cloneElement,
} from "react";

function useDeepCompareMemoize(value) {
  const ref = useRef();

  if (!deepCompareEqualsForMaps(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
}

function useDeepCompareEffectForMaps(callback, dependencies) {
  useEffect(callback, dependencies.map(useDeepCompareMemoize));
}

const deepCompareEqualsForMaps = createCustomEqual((deepEqual) => (a, b) => {
  if (
    a instanceof window.google.maps.LatLng ||
    b instanceof window.google.maps.LatLng
  ) {
    return new window.google.maps.LatLng(a).equals(
      new window.google.maps.LatLng(b)
    );
  }
  // use fast-equals for other objects
  return deepEqual(a, b);
});

// options here are zoom (number like 3) and center (object like { lat: 0, lng: 0 })
const Map = ({ onClick, onIdle, children, ...options }) => {
  const ref = useRef(null);
  const [map, setMap] = useState();
  // console.log(map);

  useEffect(() => {
    if (ref.current && !map) {
      // Draw map the first time
      setMap(new window.google.maps.Map(ref.current, {})); // ref.current => div where map will be shown, {} => options as an empty object which means no markers, no center set, no zoom, etc
    }
    console.log("draw map");
  }, [ref, map]);

  // because React does not do deep comparisons, a custom hook is used
  // see discussion in https://github.com/googlemaps/js-samples/issues/946
  useDeepCompareEffectForMaps(() => {
    if (map) {
      map.setOptions(options);
    }
  }, [map, options]);

  useEffect(() => {
    if (map) {
      ["click", "idle"].forEach((eventName) =>
        window.google.maps.event.clearListeners(map, eventName)
      );

      if (onClick) {
        map.addListener("click", onClick);
      }

      if (onIdle) {
        map.addListener("idle", () => onIdle(map));
      }
    }
  }, [map, onClick, onIdle]);

  return (
    <>
      <div ref={ref} style={{ flexGrow: "1", height: "100vh" }} />
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          // set the map prop on the child component
          return cloneElement(child, { map });
        }
      })}
    </>
  );
};

export default Map;
