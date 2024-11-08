import { storageLocal } from "@pureadmin/utils";
export const tourKey = "tour-info";
export interface TourInfo {
  customerListShow?: boolean;
  customerListRead?: boolean;
  contactListShow?: boolean;
}
export function setTourStatus(tourInfo) {
  // useUserStoreHook().SET_AVATAR(avatar);
  // useUserStoreHook().SET_USERNAME(username);
  // useUserStoreHook().SET_NICKNAME(nickname);
  // useUserStoreHook().SET_ROLES(roles);
  const t = { ...storageLocal().getItem<TourInfo>(tourKey), ...tourInfo };
  console.log("tour store", t);
  storageLocal().setItem(tourKey, t);
}
