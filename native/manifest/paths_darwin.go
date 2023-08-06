package manifest

var ManifestPaths = map[string]string{
	"firefox":     "~/Library/Application Support/Mozilla/NativeMessagingHosts",
	"librewolf":   "~/Library/Application Support/LibreWolf/NativeMessagingHosts",
	"tor-browser": "~/Library/Application Support/TorBrowser-Data/Browser/Mozilla/NativeMessagingHosts",

	"chrome":   "~/Library/Application Support/Google/Chrome/NativeMessagingHosts",
	"chromium": "~/Library/Application Support/Chromium/NativeMessagingHosts",
	"vivaldi":  "~/Library/Application Support/Vivaldi/NativeMessagingHosts",
	"edge":     "~/Library/Application Support/Microsoft Edge/NativeMessagingHosts",
}
