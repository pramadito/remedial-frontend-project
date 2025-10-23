import { axiosInstance } from "@/lib/axios";
import { Role, User } from "@/types/user";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

interface Payload {
  email: string;
  password: string;
}

const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: Payload) => {
      const { data } = await axiosInstance.post<
        User & { accessToken: string }
      >("/auth/login", payload);
      return data;
    },
    onSuccess: async (data) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("role", String(data.role));
      }
      await signIn("credentials", { ...data, redirect: false });
      toast.success("sign in success");
      if ((data.role as Role) === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message ?? "Something went wrong!");
    },
  });
};

export default useLogin;
