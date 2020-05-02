/// <reference types="Cypress" />

context('visual tests', () => {

	const withTextCompareOptions = {
		failureThreshold: 0, // (1% is much too high)
		failureThresholdType: 'percent'
	};
	const noTextCompareOptions = {
		failureThreshold: 0,
		failureThresholdType: 'percent'
	};

	const selectTheme = (themeName) => {
		cy.contains(".menu-button", "Extras").click();
		cy.contains(".menu-item", "Theme").click();
		cy.contains(".menu-item", themeName).click();
		cy.get(".status-text").click(); // close menu (@TODO: menus should probably always be closed when you select a menu item)
		cy.wait(1000); // give a bit of time for theme to load
	};

	const blockOutText = ()=> {
		cy.window().then((appWindow) => {
			appWindow.eval(`
(()=> {

function textNodesUnder(el){
	const array = [];
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
	let node;
	while (node = walker.nextNode()) array.push(node);
	return array;
}

function render() {
	const text_nodes = textNodesUnder(document.body);
	const to_draw = text_nodes.filter((text_node)=>
		!text_node.parentElement.closest("script")
	).map((text_node)=> {
		const style = getComputedStyle(text_node.parentElement);
		return {text_node, style};
	});
	// divide here between looking up styles/layout above and affecting it below
	// to avoid layout thrashing
	for (const {text_node, style} of to_draw) {
		if (!text_node.parentElement.is_dynamic_wrapper) {
			const wrapper = document.createElement("span");
			text_node.parentElement.insertBefore(wrapper, text_node.nextSibling);
			wrapper.appendChild(text_node);
			wrapper.style.backgroundColor = getComputedStyle(wrapper).color;
			wrapper.style.color = "transparent";
			wrapper.is_dynamic_wrapper = true;
		}
	}
}

render();

})();
`			);
		});
	};

	it('main screenshot', () => {
		cy.visit('/');
		cy.setResolution([760, 490]);
		cy.window().should('have.property', 'get_tool_by_name'); // wait for app to be loaded
		blockOutText();
		cy.matchImageSnapshot(withTextCompareOptions);
	});

	it('brush selected', () => {
		cy.get('.tool[title="Brush"]').click();
		blockOutText();
		cy.get('.Tools-component').matchImageSnapshot(noTextCompareOptions);
	});
	it('select selected', () => {
		cy.get('.tool[title="Select"]').click();
		blockOutText();
		cy.get('.Tools-component').matchImageSnapshot(noTextCompareOptions);
	});
	it('magnifier selected', () => {
		cy.get('.tool[title="Magnifier"]').click();
		blockOutText();
		cy.get('.Tools-component').matchImageSnapshot(noTextCompareOptions);
	});
	it('airbrush selected', () => {
		cy.get('.tool[title="Airbrush"]').click();
		blockOutText();
		cy.get('.Tools-component').matchImageSnapshot(noTextCompareOptions);
	});
	it('eraser selected', () => {
		cy.get('.tool[title="Eraser/Color Eraser"]').click();
		blockOutText();
		cy.get('.Tools-component').matchImageSnapshot(noTextCompareOptions);
	});
	it('line selected', () => {
		cy.get('.tool[title="Line"]').click();
		blockOutText();
		cy.get('.Tools-component').matchImageSnapshot(noTextCompareOptions);
	});
	it('rectangle selected', () => {
		cy.get('.tool[title="Rectangle"]').click();
		blockOutText();
		cy.get('.Tools-component').matchImageSnapshot(noTextCompareOptions);
	});

	beforeEach(()=> {
		if (Cypress.$('.window:visible')[0]) {
			cy.get('.window:visible .window-close-button').click();
			cy.get('.window').should('not.be.visible');
		}
	});

	it('image attributes window', () => {
		cy.get('body').type('{ctrl}e');
		blockOutText();
		cy.get('.window:visible').matchImageSnapshot(withTextCompareOptions);
	});

	it('flip and rotate window', () => {
		// @TODO: make menus more testable, with IDs
		cy.get('.menus > .menu-container:nth-child(4) > .menu-button > .menu-hotkey').click();
		cy.get('.menus > .menu-container:nth-child(4) > .menu-popup > table > tr:nth-child(1)').click();
		blockOutText();
		cy.get('.window:visible').matchImageSnapshot(withTextCompareOptions);
	});

	it('stretch and skew window', () => {
		// @TODO: make menus more testable, with IDs
		cy.get('.menus > .menu-container:nth-child(4) > .menu-button > .menu-hotkey').click();
		cy.get('.menus > .menu-container:nth-child(4) > .menu-popup > table > tr:nth-child(2)').click();
		// @TODO: wait for images to load and include images?
		blockOutText();
		cy.get('.window:visible').matchImageSnapshot(Object.assign({}, withTextCompareOptions, { blackout: ["img"] }));
	});

	it('help window', () => {
		// @TODO: make menus more testable, with IDs
		cy.get('.menus > .menu-container:nth-child(6) > .menu-button > .menu-hotkey').click();
		cy.get('.menus > .menu-container:nth-child(6) > .menu-popup > table > tr:nth-child(1)').click();
		cy.get('.window:visible .folder', {timeout: 10000}); // wait for sidebar contents to load
		// @TODO: wait for iframe to load
		blockOutText();
		cy.get('.window:visible').matchImageSnapshot(Object.assign({}, withTextCompareOptions, { blackout: ["iframe"] }));
	});

	it('about window', () => {
		// @TODO: make menus more testable, with IDs
		cy.get('.menus > .menu-container:nth-child(6) > .menu-button > .menu-hotkey').click();
		cy.get('.menus > .menu-container:nth-child(6) > .menu-popup > table > tr:nth-child(3)').click();
		blockOutText();
		cy.get('.window:visible').matchImageSnapshot(Object.assign({}, withTextCompareOptions, { blackout: ["img", "#maybe-outdated-line"] }));
	});

	it('eye gaze mode', () => {
		cy.get('.tool[title="Select"]').click();
		cy.contains(".menu-button", "Extras").click();
		cy.contains(".menu-item", "Eye Gaze Mode").click();
		cy.wait(100);
		// cy.contains(".menu-button", "View").click();
		// cy.get("body").trigger("pointermove", { clientX: 200, clientY: 150 });
		cy.get(".status-text").click();
		cy.wait(100);
		blockOutText();
		cy.matchImageSnapshot(withTextCompareOptions);
	});

	it('modern theme eye gaze mode', () => {
		selectTheme("Modern");
		// cy.contains(".menu-button", "View").click();
		// cy.get("body").trigger("pointermove", { clientX: 200, clientY: 150 });
		cy.wait(100);
		blockOutText();
		cy.matchImageSnapshot(withTextCompareOptions);
	});

	it('modern theme', () => {
		cy.contains(".menu-button", "Extras").click();
		cy.contains(".menu-item", "Eye Gaze Mode").click();
		cy.wait(100);
		// cy.contains(".menu-button", "View").click();
		// cy.get("body").trigger("pointermove", { clientX: 200, clientY: 150 });
		cy.get(".status-text").click();
		cy.wait(100);
		blockOutText();
		cy.matchImageSnapshot(withTextCompareOptions);
	});

	it('winter theme', () => {
		selectTheme("Winter");
		// cy.contains(".menu-button", "View").click();
		// cy.get("body").trigger("pointermove", { clientX: 200, clientY: 150 });
		cy.wait(100);
		blockOutText();
		cy.matchImageSnapshot(withTextCompareOptions);
	});

	it('winter theme vertical color box', () => {
		cy.wait(500);
		cy.contains(".menu-button", "Extras").click();
		cy.contains(".menu-item", "Vertical Color Box").click();
		cy.wait(500);
		cy.get(".status-text").click();
		cy.wait(100);
		blockOutText();
		cy.matchImageSnapshot(withTextCompareOptions);
	});

	it('classic theme vertical color box', () => {
		selectTheme("Classic");
		blockOutText();
		cy.matchImageSnapshot(withTextCompareOptions);
	});

	it('modern theme vertical color box', () => {
		selectTheme("Modern");
		blockOutText();
		cy.matchImageSnapshot(withTextCompareOptions);
	});

});
