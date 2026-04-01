import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { setColorScheme, useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
} from "react-native";

export default function SignInScreen() {
  const [hiddenPassword, setHiddenPassword] = React.useState(true);
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const inputBorder = useThemeColor({ light: "#ccc", dark: "#333" }, "icon");
  const buttonBg = useThemeColor({ dark: "#007AFF" }, "tint");
  const inputBg = useThemeColor(
    { light: "#fff", dark: "#1a1a1a" },
    "background",
  );
  const current = useColorScheme();
  const router = useRouter();

  const { signIn, loading, error } = useAuth();

  // Hook form
  type FormData = {
    username: string;
    usernameRequired: string;
    password: string;
    passwordRequired: string;
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { username: "", password: "" },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log("Sign in data:", data);

    try {
      // Call signIn; server will set HttpOnly cookies (access_token) on success.
      const result = await signIn(data.username, data.password);
      console.log("Sign in result:", result);

      // If sign-in succeeded, navigate to main tabs/home.
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleDarkModeToggle = () => {
    // Toggle between 'light' and 'dark' and persist preference in localStorage
    const next = current === "dark" ? "light" : "dark";
    if (typeof setColorScheme === "function") {
      setColorScheme(next);
    } else {
      // Fallback for hot-reload / unexpected module shape: update DOM and localStorage directly
      try {
        localStorage.setItem("theme", next);
      } catch {}
      if (next === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      // Dispatch a theme-change event so hooks listening update as well
      window.dispatchEvent(new Event("theme-change"));
    }
  };

  const togglePasswordVisibility = () => {
    setHiddenPassword((prev) => !prev);
  };

  return (
    <ThemedView
      style={[styles.signInContainer, { backgroundColor: backgroundColor }]}
    >
      {/* Add dark mode toggle here */}
      <ThemedView style={{ position: "absolute", top: 40, right: 20 }}>
        <Pressable onPress={handleDarkModeToggle}>
          <ThemedText>Toggle Dark Mode</ThemedText>
        </Pressable>
      </ThemedView>
      {/* Add image logo here */}
      <Image source={require("@/assets/images/Logo.png")} style={styles.logo} />
      <ThemedText type="title" style={styles.title}>
        Welcome to Quiz Match Game!
      </ThemedText>
      {/* Add sign-in form here (e.g., buttons for Google, Facebook, etc.) */}
      <ThemedView style={styles.formContainer}>
        <ThemedView style={styles.groupContainer}>
          <ThemedText style={styles.label}>Username</ThemedText>
          {/* Add username input field here */}
          <Controller
            control={control}
            name="username"
            rules={{ required: "Username is required" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={[
                  styles.input,
                  {
                    color: textColor,
                    borderColor: inputBorder,
                    backgroundColor: inputBg,
                  },
                ]}
                placeholder="Enter your username"
                placeholderTextColor={textColor}
                autoCapitalize="none"
              />
            )}
          />
          {errors.username && (
            <ThemedText style={styles.errorText}>
              {errors.username.message}
            </ThemedText>
          )}
        </ThemedView>
        <ThemedView style={styles.groupContainer}>
          <ThemedText style={styles.label}>Password</ThemedText>
          {/* Add password input field here */}
          <Controller
            control={control}
            name="password"
            rules={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={[
                  styles.input,
                  {
                    color: textColor,
                    borderColor: inputBorder,
                    backgroundColor: inputBg,
                  },
                ]}
                placeholder="Enter your password"
                placeholderTextColor={textColor}
                secureTextEntry={hiddenPassword}
                autoCapitalize="none"
              />
            )}
          />
          {errors.password && (
            <ThemedText style={styles.errorText}>
              {errors.password.message}
            </ThemedText>
          )}
          <Pressable
            onPress={togglePasswordVisibility}
            style={{ position: "absolute", right: 10, top: 32, padding: 5 }}
          >
            <ThemedText style={styles.togglePasswordT}>
              {hiddenPassword ? "Show" : "Hide"}
            </ThemedText>
          </Pressable>
        </ThemedView>
        <ThemedText
          style={styles.forgotPasswordT}
          onPress={() => console.log("Forgot password pressed")}
        >
          Forgot your password?
        </ThemedText>
        <Pressable
          style={[styles.button, { backgroundColor: buttonBg }]}
          onPress={handleSubmit(onSubmit)}
        >
          <ThemedText style={styles.buttonText}>
            {loading ? <ActivityIndicator color="#fff" /> : "Sign In"}
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: "#f84a4aff" }]}
          onPress={() => console.log("Google Sign In button pressed")}
        >
          <ThemedText style={styles.buttonText}>Google Sign In</ThemedText>
        </Pressable>
        {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
        <ThemedText
          style={styles.signUpText}
          onPress={() => router.replace("/sign-up")}
        >
          Don't have an account? Sign Up
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  signInContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    paddingHorizontal: 20,
    width: "80%",
    textAlign: "center",
  },
  formContainer: {
    width: "80%",
    marginTop: 20,

    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  groupContainer: {
    width: "100%",
    marginBottom: 15,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 5,
    position: "relative",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: "#fff",
  },
  togglePasswordT: {
    alignSelf: "flex-end",
    color: "#007AFF",
    marginTop: 5,
  },
  forgotPasswordT: {
    alignSelf: "flex-end",
    color: "#007AFF",
    marginBottom: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "#ff6b6b",
    marginTop: 6,
    alignSelf: "flex-start",
  },
  signUpText: {
    marginTop: 15,
    color: "#007AFF",
  },
});
