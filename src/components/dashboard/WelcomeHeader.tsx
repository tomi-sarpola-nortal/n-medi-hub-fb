interface WelcomeHeaderProps {
  userName: string;
}

export default function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight font-headline">
        Welcome back, {userName}!
      </h2>
      <p className="text-sm text-muted-foreground">
        Here&apos;s an overview of your recent activity and important updates.
      </p>
    </div>
  );
}
