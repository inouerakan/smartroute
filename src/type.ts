// src/types.ts

export type routeStep = {
  mode: "walk" | "transjakarta" | "mrt" | "jaklingko";
  destination: string;
};

export type routeOptionItem = {
  id: number;
  transitSequence: routeStep[];
  totalTime: number;
  fare: number;
  rating: number;
  type: string;
};

export type travelTypeProps = {
  name: string;
  current: string;
  onPress: (name: string) => void;
};

export type routeOptionProp = {
  item: routeOptionItem;
};
