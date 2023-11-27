import tkinter as tk
import pyshorteners

class URLShortenerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("URL Shortener by Dhanush")
        self.url_label = tk.Label(root, text="Enter the URL:")
        self.url_label.pack()
        self.url_entry = tk.Entry(root, width=100)
        self.url_entry.pack()
        self.output_label = tk.Label(root, text="Shortened URL:")
        self.output_label.pack()
        self.output_text = tk.Text(root, wrap=tk.WORD, width=100, height=25, state=tk.DISABLED)
        self.output_text.pack()
        self.shorten_button = tk.Button(root, text="Shorten URL", command=self.shorten_url)
        self.shorten_button.pack()
    def shorten_url(self):
        self.output_text.config(state=tk.NORMAL)
        self.output_text.delete(1.0, tk.END)
        url = self.url_entry.get()
        try:
            s = pyshorteners.Shortener()
            shortened_url = s.tinyurl.short(url)
            self.output_text.insert(tk.END, shortened_url)
        except Exception as e:
            self.output_text.insert(tk.END, f"Error: {e}")
        finally:
            self.output_text.config(state=tk.DISABLED)

if __name__ == "__main__":
    root = tk.Tk()
    app = URLShortenerApp(root)
    root.mainloop()
