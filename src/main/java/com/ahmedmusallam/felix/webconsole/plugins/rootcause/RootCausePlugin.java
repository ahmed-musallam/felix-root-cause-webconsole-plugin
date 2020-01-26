package com.ahmedmusallam.felix.webconsole.plugins.rootcause;

import static org.apache.felix.webconsole.WebConsoleConstants.PLUGIN_CATEGORY;
import static org.apache.felix.webconsole.WebConsoleConstants.PLUGIN_LABEL;

import com.google.gson.JsonArray;
import java.io.IOException;
import java.net.URL;
import java.util.NoSuchElementException;
import javax.servlet.Servlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.felix.rootcause.DSComp;
import org.apache.felix.rootcause.RootCauseCommand;
import org.apache.felix.rootcause.RootCausePrinter;
import org.apache.felix.webconsole.AbstractWebConsolePlugin;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;


@Component(
    service = Servlet.class,
    property = {
      PLUGIN_LABEL + "=" + RootCausePlugin.LABEL,
      PLUGIN_CATEGORY + "=" + RootCausePlugin.CATEGORY,
    })
public class RootCausePlugin extends AbstractWebConsolePlugin {

  // lives under OSGI Menu.
  public static final String CATEGORY = "OSGi";

  public static final String LABEL = "root-cause"; // used for the URL
  public static final String TITLE = "Root Cause"; // used for the menu item title (UI)
  public static final String RESOURCE_PREFIX = "/" + LABEL + "/";

  private String pluginHtml;

  @Reference
  private RootCauseCommand rootCauseCommand;

  @Activate
  protected void activate() {
    this.pluginHtml = getPluginHtml();
  }


  @Override
  protected void renderContent(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    if (isHtmlRequest(request)) {
      response.getWriter().write(getPluginHtml());
    } else if (request.getPathInfo().equalsIgnoreCase("/" + LABEL + "/rootcause.json")) {
      response.setContentType("application/json");
      String name = request.getParameter("name");
      response.getWriter().write(getRootCauses(name));
    }
  }

  // I know, strange, does not override anything...
  // see: https://github.com/justinedelson/felix/blob/df21d1b2eb10543de05727dce890cd6a9a347375/webconsole/src/main/java/org/apache/felix/webconsole/AbstractWebConsolePlugin.java#L230
  // This method is called by this plugin to return a URL of a "resource" file
  public URL getResource(final String path) {
    if (path.startsWith(RESOURCE_PREFIX)) {
      // get resource from this project/bundle "resources" folder
      return this.getClass().getResource(path);
    }
    return null;
  }

  @Override
  public String getLabel() {
    return LABEL;
  }

  @Override
  public String getTitle() {
    return TITLE;
  }

  protected boolean isHtmlRequest(HttpServletRequest request) {
    return ("/" + LABEL).equalsIgnoreCase(request.getPathInfo());
  }

  /**
   * Returns the plugin's HTML as String
   * The HTML in this case comes fom the plugin.html file in the "resources" folder.
   */
  private String getPluginHtml() {
    if (null == this.pluginHtml) {
      this.pluginHtml = readResourceString("plugin.html");
    }
    return this.pluginHtml;
  }

  /**
   * Read resource file from the RESOURCE_PREFIX folder.
   */
  private String readResourceString(String name) {
    return readTemplateFile(RESOURCE_PREFIX + name);
  }

  /**
   * Get root cause lines as string JSON Array.
   */
  private String getRootCauses (String name) {
    DSComp rootCause = null;
    JsonArray causes = new JsonArray();
    try {
      rootCause = rootCauseCommand.rootcause(name);
    } catch (NoSuchElementException e){
      // thrown when component cannot be found. needs to be fixed in RootCauseCommand#rootcause
    }
    if (rootCause == null) {
      causes.add("Component with name: "+ name + " Does not exist.");
    } else {
      new RootCausePrinter(causes::add).print(rootCause);
    }
    return causes.toString();
  }
}
