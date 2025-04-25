import { sendSignUpNotification } from '@/actions/notification';
import { LoadingButton } from '@/components/ui/loading-button';
import { userServices } from '@/services/legacy/supplier';
import { AxiosError } from 'axios';
import { MoveUpRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { z } from 'zod';
import { useGlobalContext } from '../Context/GlobalContext';
import CongratsIcon from '../Icons/popup/congrats-icon';
import { BaseDialog } from '../ui/BaseDialog';

const signUpSchema = z.object({
  nickname: z
    .string()
    .min(3, { message: 'Nick name must be at least 3 characters long' })
    .max(20, { message: 'Nick name must be at most 20 characters long' }),
  email: z.string().email({ message: 'Invalid email address' }),
});

export function SignUpModal() {
  const { user, fetchUser } = useGlobalContext();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ nickname: '', email: '' });
  const [errors, setErrors] = useState<{
    nickname?: string;
    email?: string;
    axios?: string;
  }>({});
  const [step, setStep] = useState(1);
  const activeAccount = useActiveAccount();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (user && user.wallet && !user.username) {
      setOpen(true);
    }
  }, [user]);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      setErrors({});
      signUpSchema.parse(formData);
      const data = new FormData();
      data.append('username', formData.nickname);
      data.append('email', formData.email);
      await userServices.updateProfile(data);
      await sendSignUpNotification(user._id);
      await fetchUser();
      setLoading(false);
      setStep(2);
    } catch (error) {
      setLoading(false);
      if (error instanceof z.ZodError) {
        const newErrors: { nickname?: string; email?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'nickname') {
            newErrors.nickname = err.message;
          }
          if (err.path[0] === 'email') {
            newErrors.email = err.message;
          }
        });
        setErrors(newErrors);
      }

      if (error instanceof AxiosError) {
        try {
          const {
            response: {
              data: { path, message },
            },
          } = error;
          if (path) {
            setErrors({ axios: message });
          }
        } catch (err) {
          console.log(err);
        }
      }
    }
  };

  return (
    <BaseDialog
      isOpen={open}
      isClose={false}
      onClose={(val) => {
        setOpen(val);
      }}
      className="md:max-w-[494px] max-w-[494px] mx-auto overflow-y-auto border-0 overflow-x-hidden bg-[#161616] rounded-xl shadow"
      modal={true}
    >
      {step === 1 && (
        <div className="w-full flex flex-col gap-y-5">
          <div className="text-white text-3xl font-extrabold mb-6 manrope-font capitalize">
            Enter your Nickname
          </div>
          <div className="w-full p-4 bg-[#232323] rounded-xl justify-start items-center gap-[13px] inline-flex">
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.3332 7.58333C17.3332 9.97657 15.3931 11.9167 12.9998 11.9167C10.6066 11.9167 8.6665 9.97657 8.6665 7.58333C8.6665 5.1901 10.6066 3.25 12.9998 3.25C15.3931 3.25 17.3332 5.1901 17.3332 7.58333Z"
                stroke="#DDF247"
                stroke-width="2.16667"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12.9998 15.1667C8.81168 15.1667 5.4165 18.5618 5.4165 22.75H20.5832C20.5832 18.5618 17.188 15.1667 12.9998 15.1667Z"
                stroke="#DDF247"
                stroke-width="2.16667"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <input
              name="nickname"
              type="text"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="Enter nickname..."
              className="grow shrink basis-0 placeholder:text-white/50 placeholder:font-normal placeholder:text-sm text-white/50 text-sm font-normal azeret-mono-font leading-snug focus:outline-none bg-[#232323]"
            />
          </div>
          <div className="w-full p-4 bg-[#232323] rounded-xl justify-start items-center gap-[13px] inline-flex">
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.25 8.66602L11.7982 14.3648C12.5259 14.85 13.4741 14.85 14.2019 14.3648L22.75 8.66602M5.41667 20.5827H20.5833C21.78 20.5827 22.75 19.6126 22.75 18.416V7.58268C22.75 6.38607 21.78 5.41602 20.5833 5.41602H5.41667C4.22005 5.41602 3.25 6.38607 3.25 7.58268V18.416C3.25 19.6126 4.22005 20.5827 5.41667 20.5827Z"
                stroke="#DDF247"
                stroke-width="2.16667"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <input
              name="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email..."
              className="grow shrink basis-0 placeholder:text-white/50 placeholder:font-normal placeholder:text-sm text-white/50 text-sm font-normal azeret-mono-font leading-snug focus:outline-none bg-[#232323]"
            />
          </div>
          <div className="w-full text-[#DDF247] text-sm font-normal azeret-mono-font leading-snug">
            {(errors.nickname || errors.email) && (
              <p>*All fields are required.</p>
            )}
            {errors.axios && <p className="text-[#DDF247]">{errors.axios}</p>}
          </div>
          <LoadingButton
            loading={loading}
            className="bg-[#ddf247] hover:bg-[#ddf247] w-full py-6 rounded-xl justify-center items-center gap-x-2 flex"
            onClick={handleSubmit}
          >
            <span className="text-[#161616] text-base font-extrabold manrope-font capitalize">
              Next
            </span>
            <MoveUpRight className="w-5 h-5" />
          </LoadingButton>
        </div>
      )}

      {step === 2 && (
        <div className="items-center justify-center flex flex-col gap-y-3 py-4 relative">
          {/* Cross Icon */}
          <div
            className="absolute top-0 right-0"
            onClick={() => setOpen(false)}
          >
            <X className="w-5 h-5" />
          </div>
          {/* <div className="text-center text-white text-[121px] font-extrabold manrope-font capitalize">
            🎉
          </div> */}
          <CongratsIcon />
          <div className="text-center mb-3 text-white text-3xl font-extrabold manrope-font capitalize">
            Congrats!
          </div>
          <div className="text-center placeholder:text-white/50 placeholder:font-normal placeholder:text-sm text-white/50 text-sm font-normal font-AzeretMono">
            You have successfully created an account.
          </div>
        </div>
      )}
    </BaseDialog>
  );
}
