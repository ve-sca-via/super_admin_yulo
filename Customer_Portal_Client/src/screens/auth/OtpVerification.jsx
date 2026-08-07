import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { useCustomerAuth } from "@/context/CustomerAuthContext";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import BackButton from "@/components/customer/BackButton";
import OtpInput from "@/components/customer/OtpInput";

const OTP_LENGTH = 4;
const RESEND_SECONDS = 30;

export default function OtpVerification({ onNext }) {
  const { pendingPhone, devOtp, requestOtp, verifyOtp, loading } = useCustomerAuth();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const handleVerify = async (code) => {
    if (code.length < OTP_LENGTH || loading) return;
    setError("");
    try {
      await verifyOtp(code);
      onNext();
    } catch (e) {
      setError(e.message || "Incorrect code. Try again.");
      setOtp("");
    }
  };

  const handleChange = (value) => {
    setOtp(value);
    if (value.length === OTP_LENGTH) handleVerify(value);
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    setOtp("");
    setError("");
    setSecondsLeft(RESEND_SECONDS);
    requestOtp(pendingPhone);
  };

  return (
    <Screen edges={["top", "bottom"]}>
      <View className="px-6 pt-2">
        <BackButton />
      </View>

      <View className="flex-1 px-6 pt-8">
        <Text className="font-jakarta-extrabold text-[26px] leading-[32px] text-foreground">Enter the OTP</Text>

        <Text className="mt-3 font-jakarta text-[14px] leading-[20px] text-muted-foreground">
          Sent via SMS to {pendingPhone}
        </Text>

        <OtpInput length={OTP_LENGTH} value={otp} onChange={handleChange} className="mt-10" />

        {error ? (
          <Text className="mt-4 text-center font-jakarta text-[13px] text-destructive">{error}</Text>
        ) : null}

        <Pressable onPress={handleResend} disabled={secondsLeft > 0} hitSlop={8} className="mt-6 items-center">
          <Text className="font-jakarta text-[13px] text-muted-foreground">
            {secondsLeft > 0
              ? `Didn't get the code? Resend in 00:${String(secondsLeft).padStart(2, "0")}`
              : "Resend code"}
          </Text>
        </Pressable>

        {__DEV__ && devOtp ? (
          <Text className="mt-4 text-center font-jakarta text-[12px] text-muted-foreground">
            Dev mode — use code {devOtp}
          </Text>
        ) : null}
      </View>

      <View className="px-6 pb-10">
        <Button disabled={otp.length < OTP_LENGTH || loading} onPress={() => handleVerify(otp)}>
          {loading ? "Verifying..." : "Verify & continue"}
        </Button>
      </View>
    </Screen>
  );
}
