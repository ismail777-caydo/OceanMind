import Purchases from "react-native-purchases";

export async function initRevenueCat() {
  try {
    await Purchases.configure({
      apiKey: process.env.EXPO_PUBLIC_RC_ANDROID_API_KEY!,
    });
  } catch (e) {
    console.log("RC init error:", e);
  }
}

export async function getOfferings() {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (e) {
    console.log("get offerings error:", e);
    return null;
  }
}

export async function purchasePackage(pkg: any) {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (e) {
    console.log("purchase error:", e);
    throw e;
  }
}