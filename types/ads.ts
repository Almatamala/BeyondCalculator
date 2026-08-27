import { Platform, StatusBar } from "react-native";
import {
	AdEventType,
	InterstitialAd,
	TestIds,
} from "react-native-google-mobile-ads";

const ANDROID_INTERSTITIAL = "ca-app-";
const IOS_INTERSTITIAL = "ca-a";

const interstitialAdUnitId: string = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.select({
  android: ANDROID_INTERSTITIAL,
  ios: IOS_INTERSTITIAL,
  }) || ANDROID_INTERSTITIAL;

export function showIntertitial(): Promise<boolean> {
  return new Promise((resolve) => {
    let resolved = false;
    const done = (v: boolean) => {
      if (resolved) return;
      resolved = true;
      resolve(v);
    };

    const ad = InterstitialAd.createForAdRequest(interstitialAdUnitId);

    ad.addAdEventListener(AdEventType.LOADED, () => {
      try {
        StatusBar.setHidden(true);
        ad.show();
      } catch {
        StatusBar.setHidden(false);
        done(false);
      }
    });
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      StatusBar.setHidden(false);
      done(true);
    });
    ad.addAdEventListener(AdEventType.ERROR, () => {
      StatusBar.setHidden(false);
      done(false);
    });

    ad.load();
  });
}