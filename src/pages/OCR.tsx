import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const OCR = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    setIsLoading(true);
    setExtractedText('');

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('ocr-extract', {
        body: { image: base64 },
      });

      if (error) throw error;

      setExtractedText(data.text);
      toast({
        title: 'Success!',
        description: 'Text extracted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to extract text',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">OCR Image Scanner</h1>
        <p className="text-muted-foreground text-lg">
          Upload images to extract text from nutrition labels, workout plans, or notes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>Select an image file to extract text from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-smooth cursor-pointer">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg mb-4"
                    />
                  ) : (
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground mb-2">
                    {previewUrl ? 'Click to upload another image' : 'Click to upload an image'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </label>
              </div>
              {isLoading && (
                <div className="flex items-center justify-center space-x-2 text-primary">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Extracting text...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Extracted Text</span>
            </CardTitle>
            <CardDescription>Text extracted from your image</CardDescription>
          </CardHeader>
          <CardContent>
            {extractedText ? (
              <div className="space-y-4">
                <div className="bg-secondary p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{extractedText}</pre>
                </div>
                <Button
                  onClick={() => navigator.clipboard.writeText(extractedText)}
                  variant="outline"
                  className="w-full"
                >
                  Copy to Clipboard
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Upload an image to see extracted text here
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OCR;