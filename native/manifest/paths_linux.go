package manifest

var ManifestPaths = map[string]string{
	"firefox":     "~/.mozilla/native-messaging-hosts",
	"librewolf":   "~/.librewolf/native-messaging-hosts",
	"tor-browser": "~/.tor-browser/app/Browser/TorBrowser/Data/Browser/.mozilla/native-messaging-hosts",

	"chrome":   "~/.config/google-chrome/NativeMessagingHosts",
	"chromium": "~/.config/chromium/NativeMessagingHosts",
	"vivaldi":  "~/.config/vivaldi/NativeMessagingHosts",
	"edge":     "~/.config/microsoft-edge/NativeMessagingHosts",
}
