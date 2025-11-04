import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { mainColor } from "@/constants"; 
import { useState } from "react";
import { api } from "@/service/api";
import { useAuth } from "@/store/auth.store";
import { useNavigate } from "react-router-dom";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nav = useNavigate()

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/auth/login", { phone, password });
      console.log("Server response:", data);

      if (data?.accessToken && data?.refreshToken && data?.user) {
        login(data.accessToken, data.refreshToken, data.user);
       
        if(data.user.role === "ADMIN"){
        nav("/admin")
        }
        
        console.log("Login success:", data.user);
      } else {
        setError("Login amalga oshmadi. Iltimos, ma'lumotlarni tekshiring.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const msg =
        err?.response?.data?.message ||
        "Login amalga oshmadi. Iltimos, qayta urinib ko‘ring.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold" style={{ color: mainColor }}>
            Login to your account
          </h1>
          <p className="text-sm text-gray-500">
            Enter your phone below to login to your account
          </p>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <Field>
          <FieldLabel htmlFor="phone" style={{ color: mainColor }}>
            Phone
          </FieldLabel>
          <Input
            id="phone"
            type="phone"
            placeholder="+998 . . ."
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password" style={{ color: mainColor }}>
              Password
            </FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm hover:underline"
              style={{ color: mainColor }}
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Field>
          <Button
            type="submit"
            style={{
              backgroundColor: mainColor,
              color: "white",
            }}
            className="hover:brightness-90 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            className="flex items-center justify-center gap-2 border-blue-500 text-blue-500 hover:bg-blue-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Login with GitHub
          </Button>
          <FieldDescription className="text-center mt-2">
            Don&apos;t have an account?{" "}
            <a href="#" className="underline" style={{ color: mainColor }}>
              Sign up
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
