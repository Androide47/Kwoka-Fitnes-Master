import { Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type SocialAuthButtonsProps = {
  /** Shown above the buttons, e.g. "Or continue with" */
  label?: string;
};

const handleSocialClick = (provider: "Facebook" | "Instagram") => {
  toast.info(`${provider} sign-in will be available once Cognito is connected.`);
};

const SocialAuthButtons = ({ label = "Or continue with" }: SocialAuthButtonsProps) => {
  return (
    <div className="mt-6 space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider">
          <span className="bg-card px-2 text-muted-foreground">{label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="w-full border-[#1877F2]/text-[#1877F2] hover:bg-[#1877F2]/10 hover:text-[#1877F2]"
          onClick={() => handleSocialClick("Facebook")}
        >
          <Facebook className="size-4" />
          Facebook
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full border-[#E4405F]/text-[#E4405F] hover:bg-[#E4405F]/10 hover:text-[#E4405F]"
          onClick={() => handleSocialClick("Instagram")}
        >
          <Instagram className="size-4" />
          Instagram
        </Button>
      </div>
    </div>
  );
};

export default SocialAuthButtons;
