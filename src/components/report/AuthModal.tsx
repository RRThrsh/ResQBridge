import { useRef, useState, useEffect } from 'react';
import {
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import { useUserAuth } from '@/context/UserAuthContext';

import { toast } from 'sonner';

import {
  sendOtp,
  verifyOtp,
  resetUserPassword,
  type AuthMode,
} from '@/lib/auth-api';

type Props = {
  open: boolean;
  onClose: () => void;
};

const errMsg = (
  err: unknown,
  fallback: string,
) =>
  err instanceof Error
    ? err.message
    : fallback;

export function AuthModal({
  open,
  onClose,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) =>
        !isOpen && onClose()
      }
    >
      <DialogContent className="sm:max-w-md gap-6 p-6">
        {open && (
          <AuthForm onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AuthForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const { login } = useUserAuth();

  // Core Auth State
  const [mode, setMode] =
    useState<AuthMode>('sign-in');

  const [step, setStep] = useState<
    'details' | 'otp'
  >('details');

  const [loginMethod, setLoginMethod] =
    useState<'email' | 'phone'>(
      'email',
    );

  const [firstName, setFirstName] =
    useState('');

  const [lastName, setLastName] =
    useState('');

  const [identifier, setIdentifier] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [code, setCode] = useState('');

  // UI State
  const [loading, setLoading] =
    useState(false);

  const [countdown, setCountdown] =
    useState(0);

  const submittingRef = useRef(false);

  // Forgot Password State
  const [forgotMode, setForgotMode] =
    useState(false);

  const [forgotStep, setForgotStep] =
    useState<
      'identifier' | 'otp' | 'password'
    >('identifier');

  const [forgotOtp, setForgotOtp] =
    useState('');

  const [
    forgotIdentifier,
    setForgotIdentifier,
  ] = useState('');

  const [newPassword, setNewPassword] =
    useState('');

  // Show Password States
  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  // Validation
  const normalizedId = identifier
    .trim()
    .toLowerCase();

  const idValid =
    loginMethod === 'email'
      ? normalizedId.includes('@')
      : normalizedId.replace(/\D/g, '')
          .length >= 10;

  const passValid =
    password.length >= 8;

  const signUpReady =
    firstName.trim() &&
    lastName.trim() &&
    idValid &&
    passValid &&
    password === confirmPassword;

  const detailsReady =
    mode === 'sign-up'
      ? signUpReady
      : idValid && passValid;

  const otpReady = code.length === 6;

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const switchMode = (
    next: AuthMode,
  ) => {
    setMode(next);

    setStep('details');
    setCode('');
    setCountdown(0);

    setPassword('');
    setConfirmPassword('');
  };

  const wrapLoad = async (
    fn: () => Promise<unknown>,
  ) => {
    if (submittingRef.current) return;

    submittingRef.current = true;

    setLoading(true);

    await fn();

    submittingRef.current = false;

    setLoading(false);
  };

  const handleSendCode = (
    e?: React.FormEvent,
  ) => {
    if (e) e.preventDefault();

    if (
      mode === 'sign-up' &&
      (!firstName.trim() ||
        !lastName.trim())
    ) {
      return toast.error(
        'Enter your full name',
      );
    }

    if (!idValid) {
      return toast.error(
        `Enter a valid ${loginMethod}`,
      );
    }

    if (!passValid) {
      return toast.error(
        'Password must be at least 8 characters',
      );
    }

    if (
      mode === 'sign-up' &&
      password !== confirmPassword
    ) {
      return toast.error(
        'Passwords do not match',
      );
    }

    wrapLoad(async () => {
      try {
        await sendOtp({
          mode,
          identifier: normalizedId,
          type: loginMethod,
          password,

          ...(mode === 'sign-up'
            ? {
                firstName:
                  firstName.trim(),

                lastName:
                  lastName.trim(),
              }
            : {}),
        });

        setIdentifier(normalizedId);

        setCode('');
        setStep('otp');

        setCountdown(60);

        toast.success(
          `Code sent to ${normalizedId}`,
        );
      } catch (error) {
        toast.error(
          errMsg(
            error,
            'Could not send code',
          ),
        );
      }
    });
  };

  const handleVerifyCode = (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!otpReady) return;

    wrapLoad(async () => {
      try {
        login(
          await verifyOtp(
            identifier,
            code,
            mode,
            password,
          ),
        );

        onClose();

        toast.success(
          mode === 'sign-up'
            ? 'Account created'
            : 'Signed in',
        );
      } catch (error) {
        toast.error(
          errMsg(error, 'Invalid code'),
        );
      }
    });
  };

  const handleForgotFlow = (
    action:
      | 'send'
      | 'verify'
      | 'reset',
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    wrapLoad(async () => {
      try {
        if (action === 'send') {
          if (!forgotIdentifier.trim()) {
            return toast.error(
              'Enter your email or phone',
            );
          }

          await sendOtp({
            mode: 'sign-in',

            identifier:
              forgotIdentifier,

            type:
              forgotIdentifier.includes(
                '@',
              )
                ? 'email'
                : 'phone',

            password: 'reset-temp',
          });

          setForgotStep('otp');

          setCountdown(60);

          toast.success('OTP sent');
        } else if (
          action === 'verify'
        ) {
          await verifyOtp(
            forgotIdentifier,
            forgotOtp,
            'sign-in',
            'reset-temp',
          );

          setForgotStep('password');

          toast.success(
            'OTP verified',
          );
        } else if (
          action === 'reset'
        ) {
          if (
            newPassword.length < 8
          ) {
            return toast.error(
              'Password must be at least 8 chars',
            );
          }

          if (
            newPassword !==
            confirmPassword
          ) {
            return toast.error(
              'Passwords do not match',
            );
          }

          await resetUserPassword(
            forgotIdentifier,
            newPassword,
          );

          toast.success(
            'Password reset successful',
          );

          setForgotMode(false);

          setForgotIdentifier('');
          setForgotOtp('');

          setNewPassword('');
          setConfirmPassword('');

          setStep('details');
        }
      } catch (error) {
        toast.error(
          errMsg(error, 'Action failed'),
        );
      }
    });
  };

  return (
    <>
      <div className="space-y-1 text-center">
        <DialogTitle
          className="text-xl font-bold"
          style={{
            fontFamily:
              'var(--font-heading)',
          }}
        >
          {forgotMode
            ? 'Reset Password'
            : step === 'otp'
              ? 'Enter verification code'
              : mode === 'sign-up'
                ? 'Create account'
                : 'Welcome back'}
        </DialogTitle>

        <DialogDescription>
          {forgotMode
            ? 'Reset your password using OTP verification.'
            : step === 'otp'
              ? `6-digit code sent to ${identifier}`
              : 'Sign in or sign up below.'}
        </DialogDescription>
      </div>

      {!forgotMode &&
        step === 'details' && (
          <Tabs
            value={mode}
            onValueChange={(v) =>
              switchMode(
                v as AuthMode,
              )
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-background border border-border h-10 p-1">
              <TabsTrigger
                value="sign-in"
                className="h-full rounded-md text-xs"
              >
                Sign In
              </TabsTrigger>

              <TabsTrigger
                value="sign-up"
                className="h-full rounded-md text-xs"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

      {forgotMode ? (
        <form
          onSubmit={(e) =>
            handleForgotFlow(
              forgotStep ===
                'identifier'
                ? 'send'
                : forgotStep ===
                    'otp'
                  ? 'verify'
                  : 'reset',
              e,
            )
          }
          className="space-y-4"
        >
          {forgotStep ===
            'identifier' && (
            <>
              <Input
                placeholder="Email or phone number"
                value={
                  forgotIdentifier
                }
                onChange={(e) =>
                  setForgotIdentifier(
                    e.target.value,
                  )
                }
                required
              />

              <SubmitButton
                loading={loading}
                disabled={
                  !forgotIdentifier
                }
              >
                Send OTP
              </SubmitButton>

              <button
                type="button"
                onClick={() =>
                  setForgotMode(
                    false,
                  )
                }
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                Back to login
              </button>
            </>
          )}

          {forgotStep === 'otp' && (
            <>
              <Input
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                value={forgotOtp}
                onChange={(e) =>
                  setForgotOtp(
                    e.target.value.replace(
                      /\D/g,
                      '',
                    ),
                  )
                }
                className="h-12 text-center text-xl font-mono tracking-[0.35em]"
              />

              <SubmitButton
                loading={loading}
                disabled={
                  forgotOtp.length !==
                  6
                }
              >
                Verify OTP
              </SubmitButton>

              <div className="flex flex-col items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={(e) =>
                    handleForgotFlow(
                      'send',
                      e as unknown as React.FormEvent,
                    )
                  }
                  disabled={
                    loading ||
                    countdown > 0
                  }
                  className="text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {countdown > 0
                    ? `Resend code in ${countdown}s`
                    : 'Resend code'}
                </button>
              </div>
            </>
          )}

          {forgotStep ===
            'password' && (
            <>
              <div className="relative">
                <Input
                  type={
                    showNewPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value,
                    )
                  }
                  className="pr-10"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      (
                        prev,
                      ) => !prev,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Confirm password"
                  value={
                    confirmPassword
                  }
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value,
                    )
                  }
                  className="pr-10"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (
                        prev,
                      ) => !prev,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <SubmitButton
                loading={loading}
                disabled={
                  !newPassword
                }
              >
                Reset Password
              </SubmitButton>
            </>
          )}
        </form>
      ) : step === 'details' ? (
        <form
          onSubmit={handleSendCode}
          className="space-y-4"
        >
          {mode === 'sign-up' && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="First name"
                value={firstName}
                onChange={(e) =>
                  setFirstName(
                    e.target.value,
                  )
                }
                required
              />

              <Input
                placeholder="Last name"
                value={lastName}
                onChange={(e) =>
                  setLastName(
                    e.target.value,
                  )
                }
                required
              />
            </div>
          )}

          <Tabs
            value={loginMethod}
            onValueChange={(v) => {
              setLoginMethod(
                v as
                  | 'email'
                  | 'phone',
              );

              setIdentifier('');
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-muted h-9 p-1">
              <TabsTrigger
                value="email"
                className="text-xs"
              >
                Email
              </TabsTrigger>

              <TabsTrigger
                value="phone"
                className="text-xs"
              >
                Phone
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Input
            type={
              loginMethod ===
              'email'
                ? 'email'
                : 'tel'
            }
            placeholder={
              loginMethod ===
              'email'
                ? 'Email address'
                : 'Phone number'
            }
            value={identifier}
            onChange={(e) =>
              setIdentifier(
                loginMethod ===
                  'phone'
                  ? e.target.value.replace(
                      /\D/g,
                      '',
                    )
                  : e.target.value,
              )
            }
            maxLength={
              loginMethod ===
              'phone'
                ? 11
                : undefined
            }
            required
          />

          <div className="relative">
            <Input
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value,
                )
              }
              className="pr-10"
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (prev) => !prev,
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {mode === 'sign-up' && (
            <div className="relative">
              <Input
                type={
                  showConfirmPassword
                    ? 'text'
                    : 'password'
                }
                placeholder="Confirm password"
                value={
                  confirmPassword
                }
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value,
                  )
                }
                className="pr-10"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (
                      prev,
                    ) => !prev,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          )}

          {mode === 'sign-in' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setForgotMode(
                    true,
                  );

                  setForgotStep(
                    'identifier',
                  );
                }}
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <SubmitButton
            loading={loading}
            disabled={!detailsReady}
          >
            Send Code
          </SubmitButton>
        </form>
      ) : (
        <form
          onSubmit={handleVerifyCode}
          className="space-y-4"
        >
          <Input
            inputMode="numeric"
            autoFocus
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(e) =>
              setCode(
                e.target.value.replace(
                  /\D/g,
                  '',
                ),
              )
            }
            className="h-12 text-center text-xl font-mono tracking-[0.35em]"
          />

          <SubmitButton
            loading={loading}
            disabled={!otpReady}
          >
            {mode === 'sign-up'
              ? 'Create account'
              : 'Sign in'}
          </SubmitButton>

          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                handleSendCode()
              }
              disabled={
                loading ||
                countdown > 0
              }
              className="text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {countdown > 0
                ? `Resend code in ${countdown}s`
                : 'Resend code'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('details');

                setCode('');
                setCountdown(0);
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Use a different email or
              phone
            </button>
          </div>
        </form>
      )}
    </>
  );
}

function SubmitButton({
  loading,
  disabled,
  children,
}: {
  loading: boolean;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="submit"
      disabled={disabled || loading}
      className="w-full"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        children
      )}
    </Button>
  );
}
