import { createCustomEqual } from "fast-equals"; // para hacer comparativas de objetos
import {
  useState,
  useEffect,
  useRef,
  Children,
  isValidElement,
  cloneElement,
} from "react";

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

const useDeepCompareMemoize = (value) => {
  const ref = useRef();
  console.log("Ref", ref);
  const deepEquals = deepCompareEqualsForMaps(value, ref.current);
  console.log({ value, ref: ref.current, deepEquals });
  if (!deepEquals) {
    console.log("Before", ref.current);
    ref.current = value;
    console.log("After", ref.current);
  }
  return ref.current;
};

const useDeepCompareEffectForMaps = (callback, dependencies) => {
  console.log("Dependencies", dependencies);
  useEffect(callback, dependencies.map(useDeepCompareMemoize)); // dependencies.map() is executed on hook register
};

// options here are zoom (number like 3) and center (object like { lat: 0, lng: 0 })
const Map = ({ onClick, onIdle, children, ...options }) => {
  console.log("from Map");
  const ref = useRef(null);
  let renderCounter = useRef(1);
  const [map, setMap] = useState();
  console.log(map);

  useEffect(() => {
    console.log("1 render use effect");
    renderCounter.current += 1;
  });
  console.log(renderCounter.current);

  useEffect(() => {
    console.log("2 set map use effect");

    if (ref.current && !map) {
      // Draw map the first time
      setMap(new window.google.maps.Map(ref.current, {})); // ref.current => div where map will be shown, {} => options as an empty object which means no markers, no center set, no zoom, etc
    }
    // console.log("draw map");
  }, [ref, map]);

  // because React does not do deep comparisons, a custom hook is used
  // see discussion in https://github.com/googlemaps/js-samples/issues/946
  useDeepCompareEffectForMaps(() => {
    console.log("3 compare use effect");

    if (map) {
      map.setOptions(options);
    }
  }, [map, options]);

  useEffect(() => {
    console.log("4 listener use effect");

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
          return cloneElement(child, { map }); // https://developers.google.com/maps/documentation/javascript/reference/marker#MarkerOptions.map
        }
      })}
    </>
  );
};

export default Map;
