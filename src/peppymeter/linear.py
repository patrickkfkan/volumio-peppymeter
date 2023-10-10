# Copyright 2016-2023 PeppyMeter peppy.player@gmail.com
# 
# This file is part of PeppyMeter.
# 
# PeppyMeter is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# PeppyMeter is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with PeppyMeter. If not, see <http://www.gnu.org/licenses/>.

import time
import pygame

from threading import Thread
from configfileparser import DIRECTION_LEFT_RIGHT, DIRECTION_BOTTOM_TOP, DIRECTION_TOP_BOTTOM, \
    DIRECTION_EDGES_CENTER, DIRECTION_CENTER_EDGES, SINGLE

class LinearAnimator(Thread):
    """ Provides linear animation in a separate thread """
    
    def __init__(self, data_source, components, base, ui_refresh_period, direction,
                 indicator_type=None, flip_left_x=None, flip_right_x=None):
        """ Initializer
        
        :param data_source: data source
        :param components: UI component
        :param base: meter base
        :param ui_refresh_period: animation interval
        :param direction: indicator moving direction
        :param indicator_type: idinicator type e.g. 'single'
        :param flip_left_x: flip left channel image horizontally
        :param flip_right_x: flip right channel image horizontally
        """
        Thread.__init__(self)
        self.index = 0
        self.data_source = data_source
        self.components = components
        self.comp_width, self.comp_height = components[1].content[1].get_size()
        self.run_flag = True
        self.base = base
        self.ui_refresh_period = ui_refresh_period
        self.bgr = self.base.bgr
        self.fgr = self.base.fgr
        self.indicator_type = indicator_type
        self.indicator_width = self.components[1].content[1].get_size()[0]
        self.indicator_height = self.components[1].content[1].get_size()[1]
        self.direction = direction

        if direction == None:
            self.direction = DIRECTION_LEFT_RIGHT
		
        if flip_right_x:
            self.right_origin_x = self.components[2].content_x
            self.components[2].content = (self.components[2].content[0], pygame.transform.flip(self.components[2].content[1], True, False))

        if flip_left_x:
            self.components[1].content = (self.components[1].content[0], pygame.transform.flip(self.components[1].content[1], True, False))
    
    def run(self):
        """ Thread method. Converts volume value into the mask width and displays corresponding mask. """
                
        previous_rect_left = self.components[1].bounding_box.copy()
        previous_rect_right = self.components[2].bounding_box.copy()
        previous_volume_left = previous_volume_right = 0.0
        
        while self.run_flag:
            d = self.data_source.get_current_data() 
            
            try:
                previous_rect_left, previous_volume_left = self.update_channel(d[0], self.components[1], previous_rect_left, previous_volume_left, True)
                previous_rect_right, previous_volume_right = self.update_channel(d[1], self.components[2], previous_rect_right, previous_volume_right, False)
            except:
                pass
            
            time.sleep(self.ui_refresh_period)

    def stop_thread(self):
        """ Stop thread """

        self.run_flag = False
        time.sleep(self.ui_refresh_period * 2)

    def update_channel(self, volume, component, previous_rect, previous_volume, left=True):
        """ Update channel
        
        :volume: new volume value
        :component: component to update
        :previous_rect: previous bounding rectangle
        :previous_volume: previous volume value
		:left: True - left channel, False - right channel
        """
        if previous_volume == volume and self.indicator_type != SINGLE:
            return (previous_rect, previous_volume) 
                       
        self.base.draw_bgr_fgr(previous_rect, self.base.bgr)
                          
        n = int((volume * self.base.max_volume) / (self.base.step * 100))
        if n >= len(self.base.masks): n = len(self.base.masks) - 1            
        w = self.base.masks[n]
        if w == 0: w = 1
        component.bounding_box.x = 0
        component.bounding_box.y = 0
        component.bounding_box.w = self.indicator_width
        component.bounding_box.h = self.indicator_height

        if self.indicator_type == SINGLE:
            component.content_y = component.origin_y

            if self.direction == DIRECTION_BOTTOM_TOP:
                component.content_x = component.origin_x
                component.content_y = component.origin_y - w
            elif self.direction == DIRECTION_TOP_BOTTOM:
                component.content_x = component.origin_x
                component.content_y = component.origin_y + w
            elif self.direction == DIRECTION_CENTER_EDGES:
                if left:
                    component.content_x = component.origin_x - w
                else:
                    component.content_x = component.origin_x + w
            elif self.direction == DIRECTION_EDGES_CENTER:
                if left:
                    component.content_x = component.origin_x + w
                else:
                    component.content_x = component.origin_x - w
            elif self.direction == DIRECTION_LEFT_RIGHT:
                component.content_x = component.origin_x + w
        else:
            if self.direction == DIRECTION_LEFT_RIGHT:
                component.bounding_box.w = w
            elif self.direction == DIRECTION_BOTTOM_TOP:
                component.bounding_box.h = w
                component.bounding_box.y = self.comp_height - w
                component.content_y = component.origin_y + self.comp_height - w
            elif self.direction == DIRECTION_TOP_BOTTOM:
                component.bounding_box.h = w
                component.content_y = component.origin_y
            elif self.direction == DIRECTION_EDGES_CENTER:
                if left:
                    component.bounding_box.w = w
                else:
                    component.bounding_box.w = w
                    component.bounding_box.x = self.comp_width - w
                    if hasattr(self, "right_origin_x"):
                        component.content_x = self.right_origin_x - w
            elif self.direction == DIRECTION_CENTER_EDGES:
                if left:
                    component.bounding_box.w = w
                    component.bounding_box.x = self.comp_width - w
                    component.content_x = component.origin_x - w
                else:
                    component.bounding_box.w = w

        component.draw()
            
        r = component.bounding_box.copy()
        r.x = component.content_x
        r.y = component.content_y 
        u = previous_rect.union(r)
        if self.base.fgr:
            self.base.draw_bgr_fgr(u.copy(), self.base.fgr)
            
        self.base.update_rectangle(u)
        
        return (r.copy(), volume)
