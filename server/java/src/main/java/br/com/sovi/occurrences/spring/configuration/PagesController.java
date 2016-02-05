package br.com.sovi.occurrences.spring.configuration;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 * @version 0.1.0
 */
@Controller
public class PagesController {

	private static final String PAGES_PREFIX = "pages";

	@RequestMapping(value = { "/" }, method = RequestMethod.GET)
	public String root(ModelMap model) {
		return "index";
	}

	@RequestMapping(value = { "/landingpage" }, method = RequestMethod.GET)
	public String landingpage(ModelMap model) {
		return PAGES_PREFIX + "/landingpage";
	}

	@RequestMapping(value = { "/login" }, method = RequestMethod.GET)
	public String login(ModelMap model) {
		return PAGES_PREFIX + "/login";
	}

	@RequestMapping(value = { "/register" }, method = RequestMethod.GET)
	public String register(ModelMap model) {
		return PAGES_PREFIX + "/register";
	}

	@RequestMapping(value = { "/logged" }, method = RequestMethod.GET)
	public String logged(ModelMap model) {
		return PAGES_PREFIX + "/logged";
	}

}
