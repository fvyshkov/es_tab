import time, os
from django.test import LiveServerTestCase
from django.test import SimpleTestCase
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.action_chains import ActionChains

MAX_WAIT = 10


class NewVisitorTest(SimpleTestCase):

    def setUp(self):
        self.browser = webdriver.Firefox()
        self.live_server_url = 'http://127.0.0.1:8000/'

    def tearDown(self):
        time.sleep(5)
        self.browser.quit()

    def test_open_detail(self):
        self.browser.get(self.live_server_url)
        add_sheet_button_id = 'add_layout_sheet_item'
        self.wait_for_element_by_id(add_sheet_button_id)
        add_sheet_button = self.browser.find_element_by_id(add_sheet_button_id)
        add_sheet_button.send_keys(Keys.ENTER)

        sheet_select_id = "sheet_select_dropdown"
        self.wait_for_element_by_id("sheet_select_dropdown")
        sheet_select = self.browser.find_element_by_id(sheet_select_id)
        sheet_select.click()

        input_box_xpath = "//div[@class='dx-texteditor-input-container']/input[@class='dx-texteditor-input']"
        sheet_book_xpath = "//span[text()='1.Бюджет Годовой']"
        self.wait_for_element_by_xpath(sheet_book_xpath)
        input_box_list = self.browser.find_elements_by_xpath(input_box_xpath)
        input_box_list[1].send_keys('заявка на бронирование')

        sheet_xpath = "//span[text()='Заявка на бронирование']"
        self.wait_for_element_by_xpath(sheet_xpath)
        sheet = self.browser.find_element_by_xpath(sheet_xpath)
        sheet.click()

        cell_xpath = "//span[text()='250.00']"
        self.wait_for_element_by_xpath(cell_xpath)
        cell = self.browser.find_element_by_xpath(cell_xpath)

        actions = ActionChains(self.browser);
        actions.context_click(cell).perform();

        menu_dtl_path = "//span[@class='ag-menu-option-text' and contains(text(),'етализация')]"

        self.wait_for_element_by_xpath(menu_dtl_path)
        self.browser.find_element_by_xpath(menu_dtl_path).click()

        detail_row_xpath= "//span[text()='Ежедневник формата А5']"
        self.wait_for_element_by_xpath(detail_row_xpath)

    def test_open_multy_sheet_with_filter_and_tree_expanding(self):
        self.browser.get(self.live_server_url)
        add_sheet_button_id = 'add_layout_sheet_item'
        self.wait_for_element_by_id(add_sheet_button_id)
        add_sheet_button = self.browser.find_element_by_id(add_sheet_button_id)
        add_sheet_button.send_keys(Keys.ENTER)

        sheet_select_id = "sheet_select_dropdown"
        self.wait_for_element_by_id("sheet_select_dropdown")
        sheet_select = self.browser.find_element_by_id(sheet_select_id)
        sheet_select.click()

        input_box_xpath = "//div[@class='dx-texteditor-input-container']/input[@class='dx-texteditor-input']"
        sheet_book_xpath = "//span[text()='1.Бюджет Годовой']"
        self.wait_for_element_by_xpath(sheet_book_xpath)
        input_box_list = self.browser.find_elements_by_xpath(input_box_xpath)
        input_box_list[1].send_keys('Ликвидность')

        sheet_xpath = "//span[text()='Ликвидность']"
        self.wait_for_element_by_xpath(sheet_xpath)
        sheet = self.browser.find_element_by_xpath(sheet_xpath)
        sheet.click()

        #time.sleep(3)
        #ждем загрузки данных
        btn_xpath = "//span[text()='ГО']"
        self.wait_for_element_by_xpath(btn_xpath)

        btn_xpath = "//button[span[text()='Аналитики']]"
        self.wait_for_element_by_xpath(btn_xpath)
        btn = self.browser.find_element_by_xpath(btn_xpath)
        print('btn', btn.text)
        btn.click()

        dep_arrow_xpath = "//a[@id='rdts2_trigger']"
        self.wait_for_element_by_xpath(dep_arrow_xpath)
        dep_arrow = self.browser.find_element_by_xpath(dep_arrow_xpath)
        dep_arrow.click()

        the_dep_xpath = "//input[@id='39595']"
        self.wait_for_element_by_xpath(the_dep_xpath)
        the_dep = self.browser.find_element_by_xpath(the_dep_xpath)
        the_dep.click()

        refresh_xpath = "//div[@aria-label='refresh']"
        self.wait_for_element_by_xpath(refresh_xpath)
        refresh = self.browser.find_element_by_xpath(refresh_xpath)
        refresh.click()

        self.expand_tree_node('1. Активы')
        self.expand_tree_node('1.1. Кредиты')

        ind_xpath = "//span[text()='1.1.1. Основной долг']"
        self.wait_for_element_by_xpath(ind_xpath)
        ind = self.browser.find_element_by_xpath(ind_xpath)

    def expand_tree_node(self, node_name):
        cell_xpath = "//span[text()='"+ node_name +"']"
        self.wait_for_element_by_xpath(cell_xpath)
        cell = self.browser.find_element_by_xpath(cell_xpath)
        cell.click()
        ActionChains(self.browser).send_keys(Keys.ENTER).perform()

    def wait_for_element_by_id(self, element_id):
        start_time = time.time()
        while True:
            try:
                element = self.browser.find_element_by_id(element_id)
                return
            except (AssertionError, WebDriverException) as e:
                if time.time() - start_time > MAX_WAIT:
                    raise e
                time.sleep(0.5)

    def wait_for_element_by_class_name(self, class_name):
        start_time = time.time()
        while True:
            try:
                element = self.browser.find_element_by_class_name(class_name)
                return
            except (AssertionError, WebDriverException) as e:
                if time.time() - start_time > MAX_WAIT:
                    raise e
                time.sleep(0.5)

    def wait_for_element_by_xpath(self, xpath):
        start_time = time.time()
        while True:
            try:
                element = self.browser.find_element_by_xpath(xpath)
                return
            except (AssertionError, WebDriverException) as e:
                if time.time() - start_time > MAX_WAIT:
                    raise e
                time.sleep(0.5)
"""


    def wait_for_row_in_list_table(self, row_text):
        start_time = time.time()
        while True:
            try:
                table = self.browser.find_element_by_id('id_list_table')
                rows = table.find_elements_by_tag_name('tr')
                self.assertIn(row_text, [row.text for row in rows])
                return
            except (AssertionError, WebDriverException) as e:
                if time.time() - start_time > MAX_WAIT:
                    raise e
                time.sleep(0.5)
                
    def test_can_start_a_list_for_one_user(self):
        # Edith has heard about a cool new online to-do app. She goes
        # to check out its homepage
        self.browser.get(self.live_server_url)

        # She notices the page title and header mention to-do lists
        self.assertIn('To-Do', self.browser.title)
        header_text = self.browser.find_element_by_tag_name('h1').text
        self.assertIn('To-Do', header_text)

        # She is invited to enter a to-do item straight away
        inputbox = self.browser.find_element_by_id('id_new_item')
        self.assertEqual(
            inputbox.get_attribute('placeholder'),
            'Enter a to-do item'
        )
        # She types "Buy peacock feathers" into a text box (Edith's hobby is tying
        # fly-fishing lures)
        inputbox.send_keys('Buy peacock feathers')

        # When she hits enter, the page updates, and now the page lists
        # "1: Buy peacock feathers" as an item in a to-do list
        inputbox.send_keys(Keys.ENTER)
        self.wait_for_row_in_list_table('1: Buy peacock feathers')

        # There is still a text box inviting her to add another item. She
        # enters "Use peacock feathers to make a fly" (Edith is very methodical)
        inputbox = self.browser.find_element_by_id('id_new_item')
        inputbox.send_keys('Use peacock feathers to make a fly')
        inputbox.send_keys(Keys.ENTER)

        # The page updates again, and now shows both items on her list
        self.wait_for_row_in_list_table('2: Use peacock feathers to make a fly')
        self.wait_for_row_in_list_table('1: Buy peacock feathers')

        # Satisfied, she goes back to sleep

    def test_multiple_users_can_start_lists_at_different_urls(self):
        # Edith starts a new to-do list
        self.browser.get(self.live_server_url)
        inputbox = self.browser.find_element_by_id('id_new_item')
        inputbox.send_keys('Buy peacock feathers')
        inputbox.send_keys(Keys.ENTER)
        self.wait_for_row_in_list_table('1: Buy peacock feathers')

        # She notices that her list has a unique URL
        edith_list_url = self.browser.current_url
        self.assertRegex(edith_list_url, '/lists/.+')

        # Now a new user, Francis, comes along to the site.

        ## We use a new browser session to make sure that no information
        ## of Edith's is coming through from cookies etc.
        self.browser.quit()
        self.browser = webdriver.Firefox()

        # Francis visits the home page. There is no sign of Edith's list
        self.browser.get(self.live_server_url)
        page_text = self.browser.find_element_by_tag_name('body').text
        self.assertNotIn('Buy peacock feathers', page_text)
        self.assertNotIn('make a fly', page_text)

        # Francis starts a new list by entering a new item. He is less
        # interesting than Edith...
        inputbox = self.browser.find_element_by_id('id_new_item')
        inputbox.send_keys('Buy milk')
        inputbox.send_keys(Keys.ENTER)
        self.wait_for_row_in_list_table('1: Buy milk')

        # Francis gets his own unique URL
        francis_list_url = self.browser.current_url
        self.assertRegex(francis_list_url, '/lists/.+')
        self.assertNotEqual(francis_list_url, edith_list_url)

        # Again, there is no trace of Edith's list
        page_text = self.browser.find_element_by_tag_name('body').text
        self.assertNotIn('Buy peacock feathers', page_text)
        self.assertIn('Buy milk', page_text)

        # Satsifed, they both go back to sleep

    def test_layout_and_styling(self):
        # Edith goes to the home page
        self.browser.get(self.live_server_url)
        self.browser.set_window_size(1024, 768)

        # She notices the input box is nicely centered
        inputbox = self.browser.find_element_by_id('id_new_item')
        self.assertAlmostEqual(
            inputbox.location['x'] + inputbox.size['width'] / 2,
            512,
            delta=10
        )

        # She starts a new list and sees the input is nicely centered there too
        inputbox.send_keys('testing')
        inputbox.send_keys(Keys.ENTER)
        self.wait_for_row_in_list_table('1: testing')
        inputbox = self.browser.find_element_by_id('id_new_item')
        self.assertAlmostEqual(
            inputbox.location['x'] + inputbox.size['width'] / 2,
            512,
            delta=10
        )
"""