import time, os
from django.test import LiveServerTestCase
from django.test import SimpleTestCase
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.action_chains import ActionChains

TEST = "1.Бюджет Годовой"

MAX_WAIT = 10


class NewVisitorTest(SimpleTestCase):

    def setUp(self):
        self.browser = webdriver.Firefox()
        self.live_server_url = 'http://127.0.0.1:8000/'
        self.browser.get(self.live_server_url)

    def tearDown(self):
        time.sleep(5)
        self.browser.quit()

    def _test_open_table_sheet_add_records(self):
        """
        Самый первый "настоящий" тест
        Открываем виджет
        Выбираем лист path=["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"]
        Устанавливаем значения аналитик
        Если есть записи - удаляем их одну за другой
        Добавляем 10 записей, вводим при этом тестовые знгачения для поля "арендатор"
        Проверяем, что в статус-баре отобразилось именно 10 записей
        """
        path=["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"]
        filters = {"Плоскость планирования": "План","ЦФО и инвестиции": "ГО"}
        self.prepare_table_sheet(path, filters)

        row_count=10

        for i in range(0,row_count):
            print("i", i)
            self.sheet_insert()
            self.update_cell(i, "Арендодатель", "ООО тест "+str(i+1))

        self.assertEqual(self.row_count(), row_count)



    def _test_open_table_sheet_recalc(self):
        """
        Открываем виджет
        Выбираем лист path=["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"]
        Устанавливаем значения аналитик
        Если есть записи - удаляем их одну за другой

        Вводим 3 записи, получаем такие значения
        класс, площадь  цена        стоимость   ежемесячно
        Класс А	1.00	4 300.00	4 300.00	358.33
        Класс Б	1.00	3 900.00	3 900.00	325.00
        Класс С	1.00	2 000.00	2 000.00	166.67

        Пока проверяем только сумму по "ежемесячно"!
        """
        try:
            path = ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"]
            filters = {"Плоскость планирования": "План", "ЦФО и инвестиции": "ГО"}
            self.prepare_table_sheet(path, filters)

            self.sheet_insert()
            self.update_cell(0, "Арендодатель", "ООО тест 1")
            self.update_cell(0, "Класс", "Класс А")
            self.update_cell(0, "Площадь, кв.м.", "1")


            self.sheet_insert()
            self.update_cell(1, "Арендодатель", "ООО тест 2")
            self.update_cell(1, "Класс", "Класс Б")
            self.update_cell(1, "Площадь, кв.м.", "1")

            self.sheet_insert()
            self.update_cell(2, "Арендодатель", "ООО тест 3")
            self.update_cell(2, "Класс", "Класс С")
            self.update_cell(2, "Площадь, кв.м.", "1")



            cell1 = self.find_cell(0, "Ежемесячные расходы")

            #пока не умеем зажав шифт ткнуть в  произвольную клетку (из-за необходимости перейти в начало грида для поиска клетки)
            #поэтому такое неаккуратное выделение области стрелками
            ActionChains(self.browser).click(cell1).perform()
            ActionChains(self.browser).key_down(Keys.SHIFT).perform()
            ActionChains(self.browser).send_keys(Keys.ARROW_DOWN).perform()
            ActionChains(self.browser).send_keys(Keys.ARROW_DOWN).perform()
            ActionChains(self.browser).key_up(Keys.SHIFT).perform()

            self.assertEqual(float(self.status_bar_value("Сумма")),850)

        except:
            self.browser.quit()
            raise

    def test_detail(self):
        """
        Открываем лист path=["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Детализация"]
        Устанавливаем значения аналитик
        Если есть записи - удаляем их одну за другой

        Вводим 1 записи, открываем деталь, вводим суммы, проверяем сумму наверху

        """
        try:
            path = ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Детализация"]
            filters = {"ЦФО и инвестиции": "ГО"}
            self.prepare_table_sheet(path, filters)

            sheet_layout = Layout(self.browser, "TableViewWithSelection")
            sheet_layout.sheet_insert()
            sheet_layout.update_cell(0, "Номер", "100500")
            cell = sheet_layout.find_cell(0, "Сумма")

            ActionChains(self.browser).context_click(cell).perform()
            menu_dtl_path = "//span[@class='ag-menu-option-text' and contains(text(),'етализация')]"
            self.wait_for_element_by_xpath(menu_dtl_path)
            self.browser.find_element_by_xpath(menu_dtl_path).click()

            detail_layout = Layout(self.browser, "TableViewDetail")

            #sheet_layout.sheet_insert()
            #sheet_layout.update_cell(1, "Номер", "100500")

            detail_layout.sheet_insert()
            detail_layout.update_cell(0, "Наименование", "Деталь 1")
            detail_layout.update_cell(0, "Сумма детали", "1")

            detail_layout.sheet_insert()
            detail_layout.update_cell(1, "Наименование", "Деталь 2")
            detail_layout.update_cell(1, "Сумма детали", "2")

            detail_layout.sheet_insert()
            detail_layout.update_cell(2, "Наименование", "Деталь 3")
            detail_layout.update_cell(2, "Сумма детали", "3")
            time.sleep(1)

        except:
            self.browser.quit()
            raise


    def _test_save_desktop(self):
        """
        пока не тест, а заготовка - открываем лист, сохранячем десктоп, удаляем десктоп
        """
        path = ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"]
        filters = {"Плоскость планирования": "План", "ЦФО и инвестиции": "ГО"}
        self.prepare_table_sheet(path, filters)

        self.save_desktop("TEST_001")
        time.sleep(1)
        self.delete_desktop("TEST_001")

    def save_desktop(self, desktop_name):
        """
        Ищем десктоп с таким же названием,
            если нашли - переписываем,
            иначе создаем новый
        """
        self.open_desktop_replace()
        desktop_row_xpath = "//td[@role='gridcell' and text()='{}']".format(desktop_name)
        try:
            self.browser.find_element_by_xpath(desktop_row_xpath).click()
            select_button_xpath = "//span[@class='dx-button-text' and text()='Выбрать']"
            self.wait_for_element_by_xpath(select_button_xpath)
            select_button = self.browser.find_element_by_xpath(select_button_xpath)
            print("select_button", select_button.text)
            select_button.click()
        except:
            close_button_xpath = "//div[@role='button' and @aria-label='Закрыть']"
            self.wait_for_element_by_xpath(close_button_xpath)
            close_btn = self.browser.find_element_by_xpath(close_button_xpath)
            print("close_btn", close_btn.text)
            #close_btn.click()
            self.browser.execute_script("arguments[0].click();", close_btn)

            self.save_new_desktop(desktop_name)


    def delete_desktop(self, desktop_name):
        self.open_desktop_replace()
        desktop_row_xpath = "//td[@role='gridcell' and text()='{}']".format(desktop_name)
        try:
            self.browser.find_element_by_xpath(desktop_row_xpath).click()
            delete_button_xpath = "//i[contains(@class, 'dx-icon-clear')]/parent::*/parent::*"
            self.wait_for_element_by_xpath(delete_button_xpath)
            delete_button = self.browser.find_element_by_xpath(delete_button_xpath)
            delete_button.click()
        except:
            pass

        close_button_xpath = "//span[@class='dx-button-text' and text()='Закрыть']/parent::*/parent::*"
        self.wait_for_element_by_xpath(close_button_xpath)
        self.browser.find_element_by_xpath(close_button_xpath).click()

    def save_new_desktop(self, desktop_name):
        print("save_new_desktop")
        self.open_additional_menu()
        button_id = 'save_desktop_new'
        self.wait_for_element_by_id(button_id)
        button = self.browser.find_element_by_id(button_id)
        button.click()

        input_xpath = "//input[@name='LONGNAME']"
        self.wait_for_element_by_xpath(input_xpath)
        self.browser.find_element_by_xpath(input_xpath).send_keys(desktop_name)

        select_button_xpath = "//span[@class='dx-button-text' and text()='OK']"
        self.wait_for_element_by_xpath(select_button_xpath)
        self.browser.find_element_by_xpath(select_button_xpath).click()

    def open_additional_menu(self):
        button_xpath = "//div[@class='dx-button-content']//i[contains(@class, 'dx-icon-overflow')]"
        self.wait_for_element_by_xpath(button_xpath)
        button = self.browser.find_element_by_xpath(button_xpath)
        button.click()

        return

        menu_xpath = "//span[text()='Сохранить новый рабочий стол']"
        try:
            self.browser.find_element_by_xpath(menu_xpath)
            return
        except:
            button_xpath = "//div[@class='dx-button-content']//i[contains(@class, 'dx-icon-overflow')]"
            self.wait_for_element_by_xpath(button_xpath)
            button = self.browser.find_element_by_xpath(button_xpath)
            button.click()
        

    def open_desktop_replace(self):
        self.open_additional_menu()
        button_id = 'save_desktop_replace'
        self.wait_for_element_by_id(button_id)
        button = self.browser.find_element_by_id(button_id)
        button.click()
        self.wait_for_element_by_xpath("//div[text()='Рабочие столы']")

    def find_layout_by_type(self, layout_item_type):
        xpath = "div[layoutitemtype='{}' and contains(@class, 'LayoutItem')]".format(layout_item_type)
        self.wait_for_element_by_xpath(xpath)
        layout = self.browser.find_element_by_xpath(xpath)
        return layout

    def prepare_table_sheet(self, path, filters):
        """
        Открываем виджет
        Выбираем лист path
        Устанавливаем значения аналитик filters
        Если есть записи - удаляем их одну за другой
        """
        self.open_sheet(path)

        self.setup_sheet_filters(filters)
        self.refresh_sheet()


        while self.row_count()>0:
            self.sheet_delete_first()


        """
        input_box_list = self.browser.find_elements_by_xpath(input_box_xpath)
        input_box_list[1].send_keys('заявка на бронирование')

        sheet_xpath = "//span[text()='Заявка на бронирование']"
        self.wait_for_element_by_xpath(sheet_xpath)
        sheet = self.browser.find_element_by_xpath(sheet_xpath)
        sheet.click()

        cell = self.find_cell_by_value("250.00")

        actions = ActionChains(self.browser)
        actions.context_click(cell).perform()

        menu_dtl_path = "//span[@class='ag-menu-option-text' and contains(text(),'етализация')]"

        print("ищем пункт контекстного меню 'детализация'")

        self.wait_for_element_by_xpath(menu_dtl_path)

        print("НАШЛИ пункт контекстного меню 'детализация'")
        self.browser.find_element_by_xpath(menu_dtl_path).click()

        time.sleep(5)

        detail_row_xpath= "//span[text()='Ежедневник формата А5']"

        self.find_cell_by_value("Ежедневник формата А5")
        #self.wait_for_element_by_xpath(detail_row_xpath)
        """

    def open_sheet(self, path):
        #открыли виджет
        add_sheet_button_id = 'add_layout_sheet_item'
        self.wait_for_element_by_id(add_sheet_button_id)
        add_sheet_button = self.browser.find_element_by_id(add_sheet_button_id)
        add_sheet_button.send_keys(Keys.ENTER)
        #справочник листов
        sheet_select_id = "sheet_select_dropdown"
        self.wait_for_element_by_id("sheet_select_dropdown")
        sheet_select = self.browser.find_element_by_id(sheet_select_id)
        sheet_select.click()

        sheet_name = path[-1]
        for node in path:
            if node!=sheet_name:
                self.open_sheet_list_node(node)

        sheet_xpath = "//span[text()='{}']".format(sheet_name)
        self.wait_for_element_by_xpath(sheet_xpath)
        sheet = self.browser.find_element_by_xpath(sheet_xpath)
        sheet.click()
        self.wait_for_sheet_loaded()
        print("Открыли лист, путь", path)

    def update_cell(self, row_index, column_name, cell_value):
        cell = self.find_cell(row_index, column_name)
        cell_is_refer = self.cell_is_refer(cell)
        cell = self.find_cell(row_index, column_name)

        if cell_is_refer:
            cell.send_keys(Keys.ENTER)
            selected_item_xpath="//div[contains(@class,'dx-item')]//span[text()='{}']".format(cell_value)
            self.wait_for_element_by_xpath(selected_item_xpath)
            item = self.browser.find_element_by_xpath(selected_item_xpath)
            item.click()
        else:
            cell.send_keys(cell_value)
            cell.send_keys(Keys.ENTER)


    def row_count(self):
        return int(self.status_bar_value("Строк"))

    def status_bar_value(self, name):
        self.wait_for_sheet_loaded()
        xpath = "//div[contains(@class,'ag-status-bar')]\
                                    //span[@ref='eLabel' and text()='{}']\
                                    /parent::*/span[@ref='eValue']".format(name)
        return self.browser.find_element_by_xpath(xpath).text

    def focus_on_first_cell(self):
        first_cell_xpath = "//div[@class='cell-wrapper']/parent::*"
        self.wait_for_element_by_xpath(first_cell_xpath)
        cell = self.browser.find_element_by_xpath(first_cell_xpath)
        selected = False
        while not selected:
            try:
                cell.click()
                selected = True
            except:
                print("waiting for first cell")
                time.sleep(.1)

                self.wait_for_element_by_xpath(first_cell_xpath)
                cell = self.browser.find_element_by_xpath(first_cell_xpath)

        for i in range(0,20):
            ActionChains(self.browser).key_down(Keys.ARROW_LEFT).perform()

    def find_cell(self, row_index, column_name):

        # скроллим грид пока не найдем соответствующую колонку
        header_cell_xpath = "//span[@class='ag-header-cell-text' and text()='{}' and @role='columnheader']".format(column_name)
        column_found = False
        self.focus_on_first_cell()

        while not column_found:
            try:
                span = self.browser.find_element_by_xpath(header_cell_xpath)
                column_found = True
            except:
                ActionChains(self.browser).key_down(Keys.ARROW_RIGHT).perform()
                time.sleep(.1)
                print("looking fo column {}".format(column_name))





        header_cell_xpath = "//div[contains(@class,'ag-header-cell')]//span[@class='ag-header-cell-text' and text()='{}' and @role='columnheader']//ancestor::div[contains(@class,'ag-header-cell') and contains(@col-id,'C')]".format(column_name)
        self.wait_for_element_by_xpath(header_cell_xpath)
        header_cell = self.browser.find_element_by_xpath(header_cell_xpath)
        print("col-id", header_cell.get_attribute("col-id"))
        cell_xpath = "//div[contains(@class,'ag-row') and @row-index='{}']//div[contains(@class,'ag-cell') and @col-id='{}']".format(str(row_index), header_cell.get_attribute("col-id"))

        self.wait_for_element_by_xpath(cell_xpath)
        cell = self.browser.find_element_by_xpath(cell_xpath)

        selected = False
        while not selected:
            try:
                cell.click()
                selected = True
            except:
                time.sleep(.1)
                self.wait_for_element_by_xpath(cell_xpath)
                cell = self.browser.find_element_by_xpath(cell_xpath)
                #cell = self.find_cell(row_index, column_name)

        return cell

    def cell_is_refer(self, cell):
        try:
            if cell.find_element_by_xpath(".//div[@class='text-cell' and @refer='1']"):
                return True
        except:
            return False


    def sheet_delete_first(self):
        cells_xpath = "//div[contains(@class, 'ag-row')]//div[contains(@class, 'ag-cell')]"
        cells = self.browser.find_elements_by_xpath(cells_xpath)
        if len(cells) > 0:
            selected = False
            while not selected:
                try:
                    cells[0].click()
                    selected = True
                except:
                    time.sleep(.1)
                    cells = self.browser.find_elements_by_xpath(cells_xpath)
                    print("wait for cell")


            sheet_delete = self.browser.find_element_by_id("view_delete")
            sheet_delete.click()

            return 1

        return 0


    def sheet_insert(self):
        sheet_insert = self.browser.find_element_by_id("view_insert")
        sheet_insert.click()

    def setup_sheet_filters(self, filters):
        print("Устанавливаем аналитики", filters)
        self.open_sheet_flt_panel()

        for filter in filters:
            #здесь еще нужно будет добавить очистку фильтра, если что-то уже указано
            print(filter, '=', filters[filter])
            #вводим текст для поиска значения аналитики (чтобы не искать по иерархии)
            flt_search_xpath = "//div[text()='{}']/parent::*//input[@class='search']".format(
                filter)
            self.wait_for_element_by_xpath(flt_search_xpath)
            flt_search = self.browser.find_element_by_xpath(flt_search_xpath)
            flt_search.send_keys(filters[filter])
            #почему-то приходится еще и кнопку нажать
            flt_arrow_xpath = "//div[text()='{}']/parent::*//a[@role='button']".format(
                filter)
            self.wait_for_element_by_xpath(flt_arrow_xpath)
            dep_arrow = self.browser.find_element_by_xpath(flt_arrow_xpath)
            dep_arrow.click()
            #и наконец кликаем нужное
            flt_value_xpath = "//label[@title='{}']//input[@class='radio-item']".format(filters[filter])
            self.wait_for_element_by_xpath(flt_value_xpath)
            flt_value = self.browser.find_element_by_xpath(flt_value_xpath)
            flt_value.click()

    def wait_for_sheet_loaded(self):
        div_loaded_xpath = "//div[@class='isLoaded']"
        self.wait_for_element_by_xpath(div_loaded_xpath)
        div_loaded = self.browser.find_element_by_xpath(div_loaded_xpath)

        i = 0
        while div_loaded.get_attribute("isLoaded") != "1":
            print("waiting for loaded")
            i += 1
            if i > 20:
                raise NameError('Лист не грузится')
            time.sleep(.5)

    def open_sheet_list_node(self, node_label):
        #при открытом справочнмке листов ищем и открываем ноду с названием
        node_arrow_xpath = "//li[@aria-label='{}']//div[@class='dx-treeview-toggle-item-visibility']".format(node_label)
        self.wait_for_element_by_xpath(node_arrow_xpath)
        node_arrow = self.browser.find_element_by_xpath(node_arrow_xpath)
        node_arrow.click()

    def t_est_open_multy_sheet_with_filter_and_tree_expanding(self):

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

        self.refresh_sheet()

        self.expand_tree_node('1. Активы')
        self.expand_tree_node('1.1. Кредиты')

        ind_xpath = "//span[text()='1.1.1. Основной долг']"
        self.wait_for_element_by_xpath(ind_xpath)
        ind = self.browser.find_element_by_xpath(ind_xpath)

    def refresh_sheet(self):
        refresh_xpath = "//div[@aria-label='refresh']"
        self.wait_for_element_by_xpath(refresh_xpath)
        refresh = self.browser.find_element_by_xpath(refresh_xpath)
        refresh.click()
        self.wait_for_sheet_loaded()

    def sheet_flt_panel_is_opened(self):
        panel = self.browser.find_element_by_xpath("//div[@class='filterPanel']")
        return panel.is_displayed()

    def open_sheet_flt_panel(self):
        panel_is_opened =  self.sheet_flt_panel_is_opened()
        print("panel_is_opened", panel_is_opened)
        if not panel_is_opened:
            btn_xpath = "//button[span[text()='Аналитики']]"
            self.wait_for_element_by_xpath(btn_xpath)
            btn = self.browser.find_element_by_xpath(btn_xpath)
            print("brtn", btn)
            btn.click()

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


    def cell_xpath_by_value(self, cell_value):
        return "//div[text()='{}']".format(cell_value)

    def find_cell_by_value(self, cell_value):
        print("Ищем клетку с текстом ", cell_value)

        cell_xpath =  "//div[text()='{}']".format(cell_value)

        self.wait_for_element_by_xpath(cell_xpath)
        cell = self.browser.find_element_by_xpath(cell_xpath)
        self.browser.execute_script("arguments[0].scrollIntoView();", cell)
        print("Нашли клетку с текстом ", cell_value)
        return cell

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


class Layout(object):


    def __init__(self, browser, layout_type):
        self.browser = browser
        xpath = "//div[@layoutitemtype='{}' and contains(@class, 'LayoutItem')]".format(layout_type)
        self.layout = self.browser.find_element_by_xpath(xpath)


    def wait_for_element_by_xpath(self, xpath):
        start_time = time.time()
        while True:
            try:
                element = self.layout.find_element_by_xpath(xpath)
                return element
            except (AssertionError, WebDriverException) as e:
                if time.time() - start_time > MAX_WAIT:
                    raise e
                time.sleep(0.2)

    def find_cell(self, row_index, column_name):

        # скроллим грид пока не найдем соответствующую колонку
        header_cell_xpath = ".//span[@class='ag-header-cell-text' and text()='{}' and @role='columnheader']".format(column_name)
        column_found = False
        self.focus_on_first_cell()

        while not column_found:
            try:
                span = self.layout.find_element_by_xpath(header_cell_xpath)
                column_found = True
            except:
                ActionChains(self.browser).key_down(Keys.ARROW_RIGHT).perform()
                time.sleep(.1)
                print("looking fo column {}".format(column_name))





        header_cell_xpath = ".//div[contains(@class,'ag-header-cell')]//span[@class='ag-header-cell-text' and text()='{}' and @role='columnheader']//ancestor::div[contains(@class,'ag-header-cell') and contains(@col-id,'C')]".format(column_name)
        header_cell = self.wait_for_element_by_xpath(header_cell_xpath)
        print("col-id", header_cell.get_attribute("col-id"))
        cell_xpath = ".//div[contains(@class,'ag-row') and @row-index='{}']//div[contains(@class,'ag-cell') and @col-id='{}']".format(str(row_index), header_cell.get_attribute("col-id"))

        cell = self.wait_for_element_by_xpath(cell_xpath)

        selected = False
        while not selected:
            try:
                cell.click()
                selected = True
            except:
                time.sleep(.1)
                cell = self.wait_for_element_by_xpath(cell_xpath)

        return cell


    def focus_on_first_cell(self):
        first_cell_xpath = ".//div[@class='cell-wrapper']/parent::*"
        cell = self.wait_for_element_by_xpath(first_cell_xpath)
        selected = False
        while not selected:
            try:
                cell.click()
                selected = True
            except:
                print("waiting for first cell")
                time.sleep(.1)

                cell = self.wait_for_element_by_xpath(first_cell_xpath)

        for i in range(0,20):
            ActionChains(self.browser).key_down(Keys.ARROW_LEFT).perform()

    def sheet_insert(self):
        insert_btn = self.layout.find_element_by_id("view_insert")
        insert_btn.click()


    def update_cell(self, row_index, column_name, cell_value):
        cell = self.find_cell(row_index, column_name)
        cell_is_refer = self.cell_is_refer(cell)
        cell = self.find_cell(row_index, column_name)

        if cell_is_refer:
            cell.send_keys(Keys.ENTER)
            selected_item_xpath=".//div[contains(@class,'dx-item')]//span[text()='{}']".format(cell_value)
            item = self.wait_for_element_by_xpath(selected_item_xpath)
            item.click()
        else:
            cell.send_keys(cell_value)
            cell.send_keys(Keys.ENTER)

    def cell_is_refer(self, cell):
        try:
            if cell.find_element_by_xpath(".//div[@class='text-cell' and @refer='1']"):
                return True
        except:
            return False
