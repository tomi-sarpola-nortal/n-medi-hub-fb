import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { suggestDocuments, type SuggestDocumentsOutput } from "@/ai/flows/smart-document-suggestion";
import { FileText, Download, AlertTriangle, Lightbulb } from "lucide-react";

interface SmartSuggestionsProps {
  userRole: string;
  userRegion: string;
}

export default async function SmartSuggestions({ userRole, userRegion }: SmartSuggestionsProps) {
  let suggestions: SuggestDocumentsOutput = [];
  let errorState: string | null = null;

  try {
    suggestions = await suggestDocuments({ userRole, region: userRegion });
  } catch (error) {
    console.error("Error fetching smart suggestions:", error);
    errorState = "Failed to load document suggestions. Please try again later.";
  }

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-medium font-headline">Smart Document Suggestions</CardTitle>
        </div>
        <CardDescription>
          Based on your role ({userRole}) and region ({userRegion}), here are some documents you might find useful.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorState && (
          <div className="flex flex-col items-center justify-center p-6 bg-destructive/10 rounded-md">
            <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
            <p className="text-destructive font-semibold">{errorState}</p>
          </div>
        )}
        {!errorState && suggestions.length === 0 && (
          <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-md">
            <FileText className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No specific document suggestions for you at this moment.</p>
          </div>
        )}
        {!errorState && suggestions.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((doc) => (
              <Card key={doc.documentId} className="flex flex-col hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <FileText className="h-8 w-8 text-primary mt-1" />
                    {/* Placeholder for document actions or link */}
                    {/* <Button variant="ghost" size="icon" className="ml-auto">
                      <Download className="h-4 w-4" />
                    </Button> */}
                  </div>
                  <CardTitle className="text-md font-semibold pt-2">{doc.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground leading-relaxed">{doc.description}</p>
                </CardContent>
                <CardContent className="pt-0">
                   <Button variant="outline" size="sm" className="w-full">
                     View Document
                     <Download className="ml-2 h-4 w-4" />
                   </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
