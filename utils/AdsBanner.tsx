
//import { useEntitlements } from "@/hooks/useEntitlements";
import { Platform } from "react-native";
import {
	BannerAd,
	BannerAdSize,
	TestIds
} from "react-native-google-mobile-ads";
// Banner Ad Unit IDs reales 
const ANDROID_AD_UNIT = "";
const IOS_AD_UNIT = " ";
// Resolver adUnitId
const adUnitId: string = __DEV__ 
  ? TestIds.BANNER
  : Platform.select({
    android: ANDROID_AD_UNIT, 
    ios: IOS_AD_UNIT,    
	}) || ANDROID_AD_UNIT;

export function AdBanner() {
//const {isSubscribed} = useEntitlements();
// Hard stop: PRO = cero anuncios 
//if (isSubscribed) return null;
  return (
    <BannerAd
      unitId={adUnitId}        
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
  />
);
}   