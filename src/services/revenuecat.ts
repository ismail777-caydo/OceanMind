import Purchases, {
  LOG_LEVEL,
  CustomerInfo,
  PurchasesPackage,
  PurchasesOffering,
} from "react-native-purchases";
import { Platform } from "react-native";

const ENTITLEMENT_ID = "OCEAN MIND Pro";

function getApiKey() {
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_RC_ANDROID_API_KEY!;
  }

  return process.env.EXPO_PUBLIC_RC_IOS_API_KEY || "";
}

export async function initRevenueCat(appUserId: string) {
  Purchases.setLogLevel(LOG_LEVEL.DEBUG);

  await Purchases.configure({
    apiKey: getApiKey(),
    appUserID: appUserId,
  });
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restoreRevenueCatPurchases(): Promise<CustomerInfo> {
  return await Purchases.restorePurchases();
}

export function hasPremiumAccess(customerInfo: CustomerInfo) {
  return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
}