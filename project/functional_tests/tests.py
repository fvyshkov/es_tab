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
            sheet_layout = self.prepare_table_sheet(path, filters)

            sheet_layout.sheet_insert()
            sheet_layout.update_cell(0, "Арендодатель", "ООО тест 1")
            sheet_layout.update_cell(0, "Класс", "Класс А")
            sheet_layout.update_cell(0, "Площадь, кв.м.", "1")


            sheet_layout.sheet_insert()
            sheet_layout.update_cell(1, "Арендодатель", "ООО тест 2")
            sheet_layout.update_cell(1, "Класс", "Класс Б")
            sheet_layout.update_cell(1, "Площадь, кв.м.", "1")

            sheet_layout.sheet_insert()
            sheet_layout.update_cell(2, "Арендодатель", "ООО тест 3")
            sheet_layout.update_cell(2, "Класс", "Класс С")
            sheet_layout.update_cell(2, "Площадь, кв.м.", "1")



            cell1 = sheet_layout.find_cell(0, "Ежемесячные расходы")

            #пока не умеем зажав шифт ткнуть в  произвольную клетку (из-за необходимости перейти в начало грида для поиска клетки)
            #поэтому такое неаккуратное выделение области стрелками
            ActionChains(self.browser).click(cell1).perform()
            ActionChains(self.browser).key_down(Keys.SHIFT).perform()
            ActionChains(self.browser).send_keys(Keys.ARROW_DOWN).perform()
            ActionChains(self.browser).send_keys(Keys.ARROW_DOWN).perform()
            ActionChains(self.browser).key_up(Keys.SHIFT).perform()

            self.assertEqual(float(sheet_layout.status_bar_value("Сумма")),850)

        except:
            self.browser.quit()
            raise

    def test_multi_sheet(self):
        """
        Тестирование самих инструментов тестирования
        открываем два листа ЗК, чистим, создаем записи в них, проверяем количество
        """
        try:
            path = ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Детализация"]
            filters = {"ЦФО и инвестиции": "ГО"}
            sheet_layout1 = self.prepare_table_sheet(path, filters)

            path = ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"]
            filters = {"Плоскость планирования": "План", "ЦФО и инвестиции": "ГО"}

            sheet_layout2 = self.prepare_table_sheet(path, filters)

            sheet_layout1.sheet_insert()
            sheet_layout2.sheet_insert()
            sheet_layout1.sheet_insert()
            sheet_layout2.sheet_insert()
            sheet_layout1.sheet_insert()
            sheet_layout2.sheet_insert()
            sheet_layout1.sheet_insert()

            sheet_layout1.wait_for_loaded()
            sheet_layout2.wait_for_loaded()

            self.assertEqual(sheet_layout1.row_count(), 4)
            self.assertEqual(sheet_layout2.row_count(), 3)
        except:
            self.browser.quit()
            raise

    def _test_detail(self):
        """
        Детализация

        Открываем лист path=["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Детализация"]
        Устанавливаем значения аналитик
        Если есть записи - удаляем их одну за другой

        Вводим 2 записи, открываем детализацию для записи №1, вводим суммы, проверяем сумму наверху
        Проверяем сумму (нулевую) и на второй записи, для которой не вводили детали

        Проверяем работу формулу в детализации
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

            sheet_layout.sheet_insert()
            sheet_layout.update_cell(1, "Номер", "100501")

            detail_layout.sheet_insert()
            detail_layout.update_cell(0, "Наименование", "Деталь 1")
            detail_layout.update_cell(0, "Сумма детали", "1")

            detail_layout.sheet_insert()
            detail_layout.update_cell(1, "Наименование", "Деталь 2")
            detail_layout.update_cell(1, "Сумма детали", "2")

            detail_layout.sheet_insert()
            detail_layout.update_cell(2, "Наименование", "Деталь 3")
            detail_layout.update_cell(2, "Сумма детали", "3")

            sheet_layout.wait_for_loaded()
            detail_layout.wait_for_loaded()

            #проверки
            #1. сумма по записи 1 = 6
            sum_cell = sheet_layout.find_cell(0, "Сумма")
            sum_text = sum_cell.find_element_by_xpath(".//div[@class='cell-wrapper']/div").text
            self.assertEqual(float(sum_text), 6)

            #2. сумма по записи 2 = 0
            sum_cell = sheet_layout.find_cell(1, "Сумма")
            sum_text = sum_cell.find_element_by_xpath(".//div[@class='cell-wrapper']/div").text
            self.assertEqual(float(sum_text), 0)

            #3. формула по детализации
            cell = detail_layout.find_cell(2, "Сумма формула")
            text = cell.find_element_by_xpath(".//div[@class='cell-wrapper']/div").text
            self.assertEqual(text, "сумма*2=6.00")



        except:
            self.browser.quit()
            raise

    def _test_detail_context_menu(self):
        """
        Детализация

        Открываем лист path=["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Детализация"]
        Устанавливаем значения аналитик
        Если есть записи - удаляем их одну за другой

        Вводим 1 записи, проверяем отсутствие контекстного меню "детализация" на клетке ручного ввода
        """
        try:
            path = ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Детализация"]
            filters = {"ЦФО и инвестиции": "ГО"}
            self.prepare_table_sheet(path, filters)

            sheet_layout = Layout(self.browser, "TableViewWithSelection")
            sheet_layout.sheet_insert()
            sheet_layout.update_cell(0, "Номер", "100500")



            #проверки
            #нет "детализации" в контекстном меню
            cell = sheet_layout.find_cell(0, "Описание")
            ActionChains(self.browser).context_click(cell).perform()
            menu_dtl_path = "//span[@class='ag-menu-option-text' and contains(text(),'етализация')]"
            try:
                self.wait_for_element_by_xpath(menu_dtl_path)
                raise NameError('Опция "детализация" на клетке без детализации')
            except (AssertionError, WebDriverException) as e:
                pass


        except:
            self.browser.quit()
            raise


    def _test_expression(self):
        """
        Открываем лист path=["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Детализация"]
        Устанавливаем значения аналитик
        Если есть записи - удаляем их одну за другой

        Вводим запись, проверяем работу формулы
        """
        try:
            path = ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Детализация"]
            filters = {"ЦФО и инвестиции": "ГО"}
            self.prepare_table_sheet(path, filters)

            sheet_layout = Layout(self.browser, "TableViewWithSelection")
            sheet_layout.sheet_insert()
            sheet_layout.update_cell(0, "Номер", "100500")
            sheet_layout.update_cell(0, "Описание", "Работа формулы")

            sheet_layout.wait_for_loaded()

            #проверки

            sum_cell = sheet_layout.find_cell(0, "Формула")
            sum_text = sum_cell.find_element_by_xpath(".//div[@class='cell-wrapper']/div").text
            self.assertTrue('Запись №100500 описание = "Работа формулы", коррекция' in sum_text)


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
        возвращаем Layout для данного виджета
        """
        sheet_layout = self.open_sheet(path)
        sheet_layout.setup_sheet_filters(filters)
        sheet_layout.refresh_sheet()
        while sheet_layout.row_count()>0:
            sheet_layout.sheet_delete_first()
            time.sleep(.3)
        return sheet_layout

    def open_sheet(self, path):
        #открыли виджет
        add_sheet_button_id = 'add_layout_sheet_item'
        self.wait_for_element_by_id(add_sheet_button_id)
        add_sheet_button = self.browser.find_element_by_id(add_sheet_button_id)
        add_sheet_button.send_keys(Keys.ENTER)

        sheet_layout = Layout(self.browser, "TableViewWithSelection")

        #справочник листов
        sheet_select_id = "sheet_select_dropdown"
        sheet_select = sheet_layout.wait_for_element_by_id(sheet_select_id)
        sheet_select.click()

        first_node_xpath = "//li[@aria-label='{}' ]/div[contains(@class,'dx-item')]".format(
            path[0])
        self.wait_for_element_by_xpath(first_node_xpath)

        focused = False
        while not focused:
            try:
                self.browser.find_element_by_xpath("//li[@role='treeitem' and contains(@class, 'dx-state-focused')]//div[contains(@class,'dx-item')]")
                focused = True
            except:
                ActionChains(self.browser).send_keys(Keys.TAB).perform()
                time.sleep(.2)



        sheet_name = path[-1]
        for node in path:
            if node!=sheet_name:
                self.open_sheet_list_node(node)

        sheet_xpath = "//span[text()='{}']".format(sheet_name)
        sheet = sheet_layout.wait_for_element_by_xpath(sheet_xpath)

        print("sheet", sheet)
        clicked = False

        import sys
        while not clicked:
            try:
                ActionChains(self.browser).send_keys(Keys.ARROW_DOWN).perform()
                focused_sheet_xpath = "//li[@aria-label='{}' and @role='treeitem' and contains(@class, 'dx-state-focused')]/div[contains(@class,'dx-item')]".format(
                    sheet_name)
                focused_sheet = self.browser.find_element_by_xpath(focused_sheet_xpath)
                print("got focused sheet!", focused_sheet)
                ActionChains(self.browser).send_keys(Keys.ENTER).perform()
                clicked = True
                time.sleep(.2)
            except:
                pass
                print("Unexpected error:", sys.exc_info()[1])

        sheet_layout.wait_for_loaded()
        print("Открыли лист, путь", path)
        return sheet_layout


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

    """
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
    """

    def open_sheet_list_node(self, node_label):
        focused_node_xpath = "//li[@aria-label='{}' and @role='treeitem' and contains(@class, 'dx-state-focused')]//div[contains(@class,'dx-item')]".format(
            node_label)
        while True:
            try:
                self.browser.find_element_by_xpath(focused_node_xpath)
                print("FOUND", focused_node_xpath)
                ActionChains(self.browser).send_keys(Keys.ARROW_RIGHT).perform()
                return
            except:
                print("wait before arrow down", focused_node_xpath)
                time.sleep(.3)
                ActionChains(self.browser).send_keys(Keys.ARROW_DOWN).perform()

    def _test_open_multy_sheet_with_filter_and_tree_expanding(self):

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

    """
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
            btn.click()
    """

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

class Layout(object):


    def __init__(self, browser, layout_type):
        self.browser = browser
        xpath = "//div[@layoutitemtype='{}' and contains(@class, 'LayoutItem')]".format(layout_type)
        #self.layout = self.browser.find_element_by_xpath(xpath)

        layouts = self.browser.find_elements_by_xpath(xpath)
        #print("len(layout)", len(layouts))
        if len(layouts)>0:
            self.layout = layouts[-1]
            #print("self.layout", self.layout)
        else:
            raise NameError('Виджет не наден')




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

    def wait_for_element_by_id(self, element_id):
        start_time = time.time()
        while True:
            try:
                element = self.layout.find_element_by_id(element_id)
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
        #print("col-id", header_cell.get_attribute("col-id"))
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


    def wait_for_loaded(self):
        #чуть-чуть подлождем, а то есть вероятность что флаг  isLoaded=0 не успеет сброситься
        time.sleep(1)
        div_loaded_xpath = ".//div[@class='isLoaded']"
        div_loaded = self.wait_for_element_by_xpath(div_loaded_xpath)

        i = 0
        while div_loaded.get_attribute("isLoaded") != "1":
            print("waiting for loaded")
            i += 1
            if i > 20:
                raise NameError('Лист не грузится')
            time.sleep(.5)

    def setup_sheet_filters(self, filters):
        print("Устанавливаем аналитики", filters)
        self.open_sheet_flt_panel()

        for filter in filters:
            #здесь еще нужно будет добавить очистку фильтра, если что-то уже указано
            print(filter, '=', filters[filter])
            #вводим текст для поиска значения аналитики (чтобы не искать по иерархии)
            flt_search_xpath = ".//div[text()='{}']/parent::*//input[@class='search']".format(
                filter)
            flt_search = self.wait_for_element_by_xpath(flt_search_xpath)
            flt_search.send_keys(filters[filter])
            #почему-то приходится еще и кнопку нажать
            flt_arrow_xpath = ".//div[text()='{}']/parent::*//a[@role='button']".format(
                filter)
            dep_arrow = self.wait_for_element_by_xpath(flt_arrow_xpath)
            dep_arrow.click()
            #и наконец кликаем нужное
            flt_value_xpath = ".//label[@title='{}']//input[@class='radio-item']".format(filters[filter])
            flt_value = self.wait_for_element_by_xpath(flt_value_xpath)
            flt_value.click()

    def refresh_sheet(self):
        refresh_xpath = ".//div[@aria-label='refresh']"
        refresh = self.wait_for_element_by_xpath(refresh_xpath)
        refresh.click()
        self.wait_for_loaded()

    def sheet_flt_panel_is_opened(self):
        panel = self.wait_for_element_by_xpath(".//div[@class='filterPanel']")
        return panel.is_displayed()

    def open_sheet_flt_panel(self):
        panel_is_opened =  self.sheet_flt_panel_is_opened()
        print("panel_is_opened", panel_is_opened)
        if not panel_is_opened:
            btn_xpath = ".//button[span[text()='Аналитики']]"
            btn = self.wait_for_element_by_xpath(btn_xpath)
            btn.click()

    def refresh_sheet(self):
        refresh_xpath = ".//div[@aria-label='refresh']"
        refresh = self.wait_for_element_by_xpath(refresh_xpath)
        refresh.click()
        self.wait_for_loaded()

    def row_count(self):
        return int(self.status_bar_value("Строк"))

    def status_bar_value(self, name):
        self.wait_for_loaded()
        xpath = ".//div[contains(@class,'ag-status-bar')]\
                                    //span[@ref='eLabel' and text()='{}']\
                                    /parent::*/span[@ref='eValue']".format(name)
        return self.wait_for_element_by_xpath(xpath).text

    def sheet_delete_first(self):
        cells_xpath = ".//div[contains(@class, 'ag-row')]//div[contains(@class, 'ag-cell')]"
        cells = self.layout.find_elements_by_xpath(cells_xpath)
        if len(cells) > 0:
            selected = False
            while not selected:
                try:
                    cells[0].click()
                    selected = True
                except:
                    time.sleep(.1)
                    cells = self.layout.find_elements_by_xpath(cells_xpath)
                    print("wait for cell")


            sheet_delete = self.layout.find_element_by_id("view_delete")
            sheet_delete.click()

            return 1

        return 0

    def sheet_insert(self):
        insert_btn = self.layout.find_element_by_id("view_insert")
        insert_btn.click()
