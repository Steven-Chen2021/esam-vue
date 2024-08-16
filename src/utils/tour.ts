import { storageLocal } from "@pureadmin/utils";
export const tourKey = "tour-info";
export interface TourInfo {
  customerListShow?: boolean;
  customerListRead?: boolean;
}
export function setTourStatus(tourInfo) {
  // useUserStoreHook().SET_AVATAR(avatar);
  // useUserStoreHook().SET_USERNAME(username);
  // useUserStoreHook().SET_NICKNAME(nickname);
  // useUserStoreHook().SET_ROLES(roles);
  storageLocal().setItem(tourKey, tourInfo);
}
