program buildpkg;

{$APPTYPE CONSOLE}

uses
  SysUtils,
  buildpkgmain in 'buildpkgmain.pas',
  CompilePackageInstaller in '..\..\global\delphi\general\CompilePackageInstaller.pas',
  utilsystem in '..\..\global\delphi\general\utilsystem.pas',
  CompilePackage in '..\..\global\delphi\general\CompilePackage.pas',
  kmpinffile in '..\..\global\delphi\general\kmpinffile.pas',
  kpsfile in '..\..\global\delphi\general\kpsfile.pas',
  PackageInfo in '..\..\global\delphi\general\PackageInfo.pas',
  utildir in '..\..\global\delphi\general\utildir.pas',
  OnlineConstants in '..\..\global\delphi\productactivation\OnlineConstants.pas',
  utilstr in '..\..\global\delphi\general\utilstr.pas',
  utilfiletypes in '..\..\global\delphi\general\utilfiletypes.pas',
  Unicode in '..\..\global\delphi\general\Unicode.pas',
  VersionInfo in '..\..\global\delphi\general\VersionInfo.pas',
  PackageFileFormats in '..\..\global\delphi\general\PackageFileFormats.pas',
  GetOsVersion in '..\..\global\delphi\general\GetOsVersion.pas',
  RegistryKeys in '..\..\global\delphi\general\RegistryKeys.pas',
  KeymanDeveloperOptions in '..\..\developer\TIKE\main\KeymanDeveloperOptions.pas',
  RedistFiles in '..\..\developer\TIKE\main\RedistFiles.pas',
  DebugPaths in '..\..\global\delphi\general\DebugPaths.pas',
  CustomisationStorage in '..\..\global\delphi\cust\CustomisationStorage.pas',
  StockFileNames in '..\..\global\delphi\cust\StockFileNames.pas',
  klog in '..\..\global\delphi\general\klog.pas',
  httpuploader in '..\..\global\delphi\general\httpuploader.pas',
  Upload_Settings in '..\..\global\delphi\general\Upload_Settings.pas',
  UfrmTike in '..\..\developer\TIKE\main\UfrmTike.pas' {TikeForm: TTntForm},
  utilhttp in '..\..\global\delphi\general\utilhttp.pas',
  kmxfile in '..\..\global\delphi\general\kmxfile.pas',
  utilkeyboard in '..\..\global\delphi\general\utilkeyboard.pas',
  CRC32 in '..\..\global\delphi\general\CRC32.pas',
  KeyNames in '..\..\global\delphi\general\KeyNames.pas',
  wininet5 in '..\..\global\delphi\general\wininet5.pas',
  GlobalProxySettings in '..\..\global\delphi\general\GlobalProxySettings.pas',
  ErrorControlledRegistry in '..\..\global\delphi\vcl\ErrorControlledRegistry.pas',
  utilexecute in '..\..\global\delphi\general\utilexecute.pas',
  KeymanVersion in '..\..\global\delphi\general\KeymanVersion.pas',
  Glossary in '..\..\global\delphi\general\Glossary.pas',
  Keyman.Developer.System.Project.ProjectLog in '..\..\developer\TIKE\project\Keyman.Developer.System.Project.ProjectLog.pas',
  UMD5Hash in '..\..\global\delphi\general\UMD5Hash.pas',
  UserMessages in '..\..\global\delphi\general\UserMessages.pas',
  VisualKeyboard in '..\..\global\delphi\visualkeyboard\VisualKeyboard.pas',
  VisualKeyboardLoaderBinary in '..\..\global\delphi\visualkeyboard\VisualKeyboardLoaderBinary.pas',
  VisualKeyboardLoaderXML in '..\..\global\delphi\visualkeyboard\VisualKeyboardLoaderXML.pas',
  VisualKeyboardSaverBinary in '..\..\global\delphi\visualkeyboard\VisualKeyboardSaverBinary.pas',
  VisualKeyboardSaverXML in '..\..\global\delphi\visualkeyboard\VisualKeyboardSaverXML.pas',
  TempFileManager in '..\..\global\delphi\general\TempFileManager.pas',
  ExtShiftState in '..\..\global\delphi\comp\ExtShiftState.pas',
  VKeyChars in '..\..\global\delphi\general\VKeyChars.pas',
  VKeys in '..\..\global\delphi\general\VKeys.pas',
  DCPcrypt2 in '..\..\ext\dcpcrypt\DCPcrypt2.pas',
  DCPbase64 in '..\..\ext\dcpcrypt\DCPbase64.pas',
  DCPconst in '..\..\ext\dcpcrypt\DCPconst.pas',
  DCPrc4 in '..\..\ext\dcpcrypt\Ciphers\DCPrc4.pas',
  DCPmd5 in '..\..\ext\dcpcrypt\Hashes\DCPmd5.pas',
  JsonUtil in '..\..\global\delphi\general\JsonUtil.pas',
  Keyman.System.PackageInfoRefreshKeyboards in '..\..\global\delphi\packages\Keyman.System.PackageInfoRefreshKeyboards.pas',
  Keyman.System.KMXFileLanguages in '..\..\global\delphi\keyboards\Keyman.System.KMXFileLanguages.pas',
  Keyman.System.Standards.ISO6393ToBCP47Registry in '..\..\global\delphi\standards\Keyman.System.Standards.ISO6393ToBCP47Registry.pas',
  Keyman.System.Standards.LCIDToBCP47Registry in '..\..\global\delphi\standards\Keyman.System.Standards.LCIDToBCP47Registry.pas',
  Keyman.System.KeyboardJSInfo in '..\..\global\delphi\keyboards\Keyman.System.KeyboardJSInfo.pas',
  Keyman.System.KeyboardUtils in '..\..\global\delphi\keyboards\Keyman.System.KeyboardUtils.pas',
  Keyman.System.LanguageCodeUtils in '..\..\global\delphi\general\Keyman.System.LanguageCodeUtils.pas',
  Keyman.System.RegExGroupHelperRSP19902 in '..\..\global\delphi\general\Keyman.System.RegExGroupHelperRSP19902.pas',
  kmxfileconsts in '..\..\global\delphi\general\kmxfileconsts.pas',
  BCP47Tag in '..\..\global\delphi\general\BCP47Tag.pas',
  Keyman.System.Standards.BCP47SubtagRegistry in '..\..\global\delphi\standards\Keyman.System.Standards.BCP47SubtagRegistry.pas',
  Keyman.System.Standards.BCP47SuppressScriptRegistry in '..\..\global\delphi\standards\Keyman.System.Standards.BCP47SuppressScriptRegistry.pas',
  Keyman.System.CanonicalLanguageCodeUtils in '..\..\global\delphi\general\Keyman.System.CanonicalLanguageCodeUtils.pas',
  Keyman.System.LexicalModelUtils in '..\..\global\delphi\lexicalmodels\Keyman.System.LexicalModelUtils.pas',
  Keyman.System.PackageInfoRefreshLexicalModels in '..\..\global\delphi\packages\Keyman.System.PackageInfoRefreshLexicalModels.pas',
  Keyman.System.Standards.LangTagsRegistry in '..\..\global\delphi\standards\Keyman.System.Standards.LangTagsRegistry.pas',
  KeymanPaths in '..\..\global\delphi\general\KeymanPaths.pas';

begin
  Run;
end.
