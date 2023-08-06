//go:build !windows

package manifest

import (
	"errors"
	"fmt"
	"log"
	"os"
	"os/user"
	"path/filepath"
	"strings"
)

const genericManifest = `{
    "name": "browser_terminal",
    "description": "Extension that allows you to open a native shell in the browser",
    "path": "%s",
    "type": "stdio",
    "%s": ["%s"]
}`

const chromiumID = "chrome-extension://nbnfihffeffdhcbblmekelobgmdccfnl/"
const firefoxID = "browser_terminal@sly.ee"

func buildManifestFirefox(path string) []byte {
	return []byte(fmt.Sprintf(genericManifest, path, "allowed_extensions", firefoxID))
}

func buildManifestChromium(path string) []byte {
	return []byte(fmt.Sprintf(genericManifest, path, "allowed_origins", chromiumID))
}

func expandPath(p string) (res string, err error) {
	user, err := user.Current()
	if err != nil {
		return
	}

	res = strings.Replace(p, "~", user.HomeDir, 1)
	return
}

const manifestName = "browser_terminal.json"

func Install() (err error) {
	fmt.Println("Starting installation of native manifest")

	binaryLocation, err := filepath.Abs(os.Args[0])
	if err != nil {
		return err
	}

	fmt.Println("Binary path:", binaryLocation)

	for name, rawPath := range ManifestPaths {
		var manifestDir string
		manifestDir, err = expandPath(rawPath)
		if err != nil {
			return err
		}

		if err = os.MkdirAll(manifestDir, 0666); err != nil {
			log.Printf("Skipping %s due to error: %s\n", name, err)
			err = nil
			continue
		}

		manifestPath := filepath.Join(manifestDir, manifestName)

		var builtManifest []byte
		switch name {
		case "firefox":
			builtManifest = buildManifestFirefox(binaryLocation)
		case "chrome":
			fallthrough
		case "chromium":
			builtManifest = buildManifestChromium(binaryLocation)
		}

		if err = os.Remove(manifestPath); err != nil && !errors.Is(err, os.ErrNotExist) {
			return
		}

		if err = os.WriteFile(manifestPath, builtManifest, 0644); err != nil {
			return
		}

		fmt.Printf("Installing manifest for %s at %s\n", name, manifestPath)
	}

	return
}

func Uninstall() (err error) {
	fmt.Println("Starting uninstallation of native manifest")

	for name, rawPath := range ManifestPaths {
		var manifestDir string
		manifestDir, err = expandPath(rawPath)
		if err != nil {
			return err
		}

		manifestPath := filepath.Join(manifestDir, manifestName)

		if err = os.Remove(manifestPath); err != nil && !errors.Is(err, os.ErrNotExist) {
			log.Printf("Skipping %s due to error: %s\n", name, err)
			err = nil
			continue
		}

		fmt.Printf("Uninstalling manifest for %s at %s\n", name, manifestPath)
	}

	return
}
