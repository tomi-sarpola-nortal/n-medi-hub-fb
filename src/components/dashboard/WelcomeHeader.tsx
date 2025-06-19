interface WelcomeHeaderProps {
  translatedWelcomeMessage: string;
}

export default function WelcomeHeader({ translatedWelcomeMessage }: WelcomeHeaderProps) {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight font-headline">
        {translatedWelcomeMessage}
      </h2>
      <p className="text-sm text-muted-foreground mt-1">2025-06-17</p>
      <p className="text-sm text-muted-foreground mt-2">
        Here&apos;s an overview of your recent activity and important updates.
      </p>
    </div>
  );
}
